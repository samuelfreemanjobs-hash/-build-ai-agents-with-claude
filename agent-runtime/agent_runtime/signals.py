"""Model and infra signals — radar vs core-config for faster, cheaper, safer runs."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import yaml

from agent_runtime.config import AgentConfig, load_core_config


@dataclass(frozen=True)
class RadarItem:
    id: str
    category: str
    title: str
    url: str
    applies_to: list[str]
    signal: str
    action: str


@dataclass(frozen=True)
class StackSignal:
    level: str
    code: str
    message: str
    action: str
    source_url: str | None = None


@dataclass
class StackSignalsReport:
    agent_id: str
    primary_model: str
    signals: list[StackSignal] = field(default_factory=list)

    def critical_count(self) -> int:
        return sum(1 for s in self.signals if s.level == "critical")

    def warn_count(self) -> int:
        return sum(1 for s in self.signals if s.level == "warn")


def _load_radar(radar_path: Path) -> list[RadarItem]:
    if not radar_path.is_file():
        return []
    raw = yaml.safe_load(radar_path.read_text(encoding="utf-8")) or {}
    items: list[RadarItem] = []
    for entry in raw.get("watchlist", []):
        items.append(
            RadarItem(
                id=entry["id"],
                category=entry.get("category", "infra"),
                title=entry["title"],
                url=entry.get("url", ""),
                applies_to=entry.get("applies_to", ["*"]),
                signal=entry.get("signal", ""),
                action=entry.get("action", "review"),
            )
        )
    return items


def _applies(item: RadarItem, agent_id: str) -> bool:
    return "*" in item.applies_to or agent_id in item.applies_to


def evaluate_stack_signals(
    core_config_path: Path | str,
    radar_path: Path | str | None = None,
) -> StackSignalsReport:
    config = load_core_config(core_config_path)
    if radar_path is None:
        radar_path = Path(__file__).resolve().parent.parent / "signals" / "radar.yaml"
    radar = _load_radar(Path(radar_path))
    signals: list[StackSignal] = []

    for item in radar:
        if not _applies(item, config.agent_id):
            continue
        if item.category == "model" and "deprecated" in item.signal.lower():
            if config.primary_model in item.signal or "VERIFY" in item.signal:
                signals.append(
                    StackSignal(
                        level="warn",
                        code=f"RADAR_{item.id}",
                        message=f"{item.title}: verify model id {config.primary_model}",
                        action=item.action,
                        source_url=item.url or None,
                    )
                )

    for item in radar:
        if not _applies(item, config.agent_id):
            continue
        if item.category == "harness" and config.agent_id.endswith("-agent"):
            signals.append(
                StackSignal(
                    level="info",
                    code=f"RADAR_{item.id}",
                    message=item.signal,
                    action=item.action,
                    source_url=item.url or None,
                )
            )
            break

    max_tokens = config.limits.get("max_context_tokens")
    if max_tokens and int(max_tokens) > 200_000:
        signals.append(
            StackSignal(
                level="warn",
                code="LIMIT_LARGE_CONTEXT",
                message="High max_context_tokens increases cost; use harness for heavy context",
                action="Prefer subprocess harness for repo scans; compact before LLM stages",
            )
        )

    if not config.emit_token_counts:
        signals.append(
            StackSignal(
                level="warn",
                code="OBS_NO_TOKEN_COUNTS",
                message="emit_token_counts is false — cannot track cost per run",
                action="Set observability/emit_token_counts true in core-config.xml",
            )
        )

    for item in radar:
        if item.category == "mcp" and _applies(item, config.agent_id):
            signals.append(
                StackSignal(
                    level="info",
                    code=f"RADAR_{item.id}",
                    message=item.signal,
                    action=item.action,
                    source_url=item.url or None,
                )
            )

    return StackSignalsReport(
        agent_id=config.agent_id,
        primary_model=config.primary_model,
        signals=signals,
    )


def format_signals_log(report: StackSignalsReport) -> str:
    lines = [f"stack_signals agent={report.agent_id} model={report.primary_model}"]
    for sig in report.signals:
        url = f" url={sig.source_url}" if sig.source_url else ""
        lines.append(f"  [{sig.level}] {sig.code}: {sig.message} → {sig.action}{url}")
    return "\n".join(lines)