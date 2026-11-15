"""Parse agent/core-config.xml environmental gates."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class ModelSpec:
    model_id: str
    role: str
    trigger: str | None = None


@dataclass
class AgentConfig:
    agent_id: str
    version: str
    primary_model: str
    fallback_model: str | None
    models: list[ModelSpec] = field(default_factory=list)
    limits: dict[str, str] = field(default_factory=dict)
    paths: dict[str, str] = field(default_factory=dict)
    observability: dict[str, str] = field(default_factory=dict)

    @property
    def emit_token_counts(self) -> bool:
        return self.observability.get("emit_token_counts", "false").lower() == "true"


def _text(element: ET.Element | None, default: str = "") -> str:
    if element is None or element.text is None:
        return default
    return element.text.strip()


def load_core_config(config_path: Path | str) -> AgentConfig:
    path = Path(config_path)
    root = ET.parse(path).getroot()
    agent_id = root.get("agent", path.parent.parent.name)

    models: list[ModelSpec] = []
    primary = "claude-sonnet-4-5"
    fallback: str | None = None
    models_el = root.find("models")
    if models_el is not None:
        for node in models_el:
            if node.tag != "primary" and node.tag != "fallback":
                continue
            spec = ModelSpec(
                model_id=node.get("id", primary),
                role=node.get("role", ""),
                trigger=node.get("trigger"),
            )
            models.append(spec)
            if node.tag == "primary":
                primary = spec.model_id
            elif node.tag == "fallback":
                fallback = spec.model_id

    limits: dict[str, str] = {}
    limits_el = root.find("limits")
    if limits_el is not None:
        for child in limits_el:
            tag = child.tag.split("}")[-1]
            limits[tag] = _text(child)

    paths: dict[str, str] = {}
    paths_el = root.find("paths")
    if paths_el is not None:
        for child in paths_el:
            tag = child.tag.split("}")[-1]
            paths[tag] = _text(child)

    observability: dict[str, str] = {}
    obs_el = root.find("observability")
    if obs_el is not None:
        for child in obs_el:
            tag = child.tag.split("}")[-1]
            observability[tag] = _text(child)

    return AgentConfig(
        agent_id=agent_id,
        version=root.get("version", "1.0.0"),
        primary_model=primary,
        fallback_model=fallback,
        models=models,
        limits=limits,
        paths=paths,
        observability=observability,
    )