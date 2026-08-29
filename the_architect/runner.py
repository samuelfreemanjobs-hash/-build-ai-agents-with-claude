"""Run The Architect agent via Claude Agent SDK."""

from __future__ import annotations

import asyncio
from typing import Any

from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient, query

from the_architect.config import REPO_ROOT, get_api_key
from the_architect.prompts import build_system_prompt
from the_architect.tools import ARCHITECT_TOOL_NAMES, create_architect_mcp_server

DEFAULT_ALLOWED_TOOLS = [
    "Read",
    "Write",
    "Edit",
    "Grep",
    "Glob",
    *ARCHITECT_TOOL_NAMES,
]


def build_options(
    *,
    max_turns: int = 40,
    permission_mode: str = "acceptEdits",
    session_extra: str | None = None,
) -> ClaudeAgentOptions:
    server = create_architect_mcp_server()
    return ClaudeAgentOptions(
        system_prompt=build_system_prompt(extra=session_extra),
        cwd=str(REPO_ROOT),
        add_dirs=[str(REPO_ROOT / "agents" / "the-architect")],
        mcp_servers={"architect": server},
        allowed_tools=DEFAULT_ALLOWED_TOOLS,
        permission_mode=permission_mode,
        max_turns=max_turns,
    )


async def run_once(prompt: str, *, max_turns: int = 40) -> None:
    if not get_api_key():
        raise SystemExit(
            "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
        )

    options = build_options(max_turns=max_turns)

    async for message in query(prompt=prompt, options=options):
        _print_message(message)


async def run_chat(*, max_turns: int = 40) -> None:
    if not get_api_key():
        raise SystemExit(
            "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
        )

    options = build_options(max_turns=max_turns)
    print("The Architect — agentic mode. Type 'exit' to quit.\n")

    async with ClaudeSDKClient(options=options) as client:
        while True:
            try:
                user_input = input("\nYou: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nBye.")
                break

            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("Bye.")
                break

            await client.query(user_input)
            async for message in client.receive_response():
                _print_message(message)


def _print_message(message: Any) -> None:
    """Print SDK messages to stdout."""
    text = getattr(message, "result", None) or getattr(message, "content", None)
    if text:
        print(text)
        return

    subtype = getattr(message, "subtype", None)
    if subtype:
        print(f"[{subtype}]")

    if hasattr(message, "model_dump"):
        data = message.model_dump()
        if data.get("type") == "assistant" and data.get("message"):
            for block in data["message"].get("content", []):
                if block.get("type") == "text":
                    print(block.get("text", ""))
        elif data.get("type") == "result":
            print(data.get("result", ""))
