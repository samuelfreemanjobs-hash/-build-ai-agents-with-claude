"""MCP tool routing — standard integration surface with harness fallback."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

from agent_runtime.harness import HarnessResult, HarnessRunner


@dataclass(frozen=True)
class ToolRoute:
    name: str
    harness_script: str | None = None
    mcp_namespace: str | None = None
    mcp_tool: str | None = None
    description: str = ""


class McpToolRouter:
    """
    Resolve logical tools to harness or MCP.

    Transport is controlled by AGENT_TOOL_TRANSPORT:
    - harness (default): run scripts/*.py
    - mcp: require MCP bridge process (see invoke_mcp)
    - auto: harness if script exists, else MCP when configured
    """

    def __init__(
        self,
        registry_path: Path | str,
        harness: HarnessRunner,
    ):
        self.harness = harness
        self.routes = self._load_registry(Path(registry_path))
        self.transport = os.environ.get("AGENT_TOOL_TRANSPORT", "auto").lower()

    @staticmethod
    def _load_registry(path: Path) -> dict[str, ToolRoute]:
        if not path.is_file():
            return {}
        raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        tools = raw.get("tools", {})
        routes: dict[str, ToolRoute] = {}
        for name, spec in tools.items():
            mcp = spec.get("mcp") or {}
            routes[name] = ToolRoute(
                name=name,
                harness_script=spec.get("harness"),
                mcp_namespace=mcp.get("namespace"),
                mcp_tool=mcp.get("tool"),
                description=spec.get("description", ""),
            )
        return routes

    def invoke(
        self,
        tool_name: str,
        harness_args: tuple[str, ...] = (),
        mcp_arguments: dict[str, Any] | None = None,
    ) -> HarnessResult | dict[str, Any]:
        route = self.routes.get(tool_name)
        if route is None:
            return HarnessResult(
                status="FAIL",
                data={"error": f"Unknown tool: {tool_name}"},
                stdout="",
                stderr="",
                exit_code=1,
                script="",
            )

        use_mcp = self.transport == "mcp" or (
            self.transport == "auto"
            and route.harness_script is None
            and route.mcp_namespace
        )
        if use_mcp and route.mcp_namespace and route.mcp_tool:
            return invoke_mcp(route.mcp_namespace, route.mcp_tool, mcp_arguments or {})

        if route.harness_script:
            return self.harness.run(route.harness_script, *harness_args)

        return HarnessResult(
            status="FAIL",
            data={"error": f"No transport for tool {tool_name}"},
            stdout="",
            stderr="",
            exit_code=1,
            script=route.harness_script or "",
        )


def invoke_mcp(namespace: str, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """
    MCP bridge hook.

    Cloud and IDE hosts inject MCP; product backends call this when
    AGENT_TOOL_TRANSPORT=mcp and AGENT_MCP_BRIDGE is set to a JSON-lines helper script.
    """
    bridge = os.environ.get("AGENT_MCP_BRIDGE")
    if not bridge:
        return {
            "status": "FAIL",
            "error": "MCP transport requested but AGENT_MCP_BRIDGE is unset",
            "namespace": namespace,
            "tool": tool_name,
        }
    # Bridge contract is host-specific; products document wiring in docs/agent-stack.md
    return {
        "status": "SKIP",
        "message": "MCP bridge configured but not executed in this runtime",
        "namespace": namespace,
        "tool": tool_name,
        "arguments": arguments,
    }