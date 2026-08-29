"""Custom MCP tools for The Architect agent."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from claude_agent_sdk import create_sdk_mcp_server, tool

from the_architect.config import AGENT_ROOT, PROJECTS_DIR, ensure_projects_dir, slugify
from the_architect.learning.pipeline import format_summary, run_daily_learning
from the_architect.memory.store import MemoryStore

PHASES = [
    "INTAKE",
    "RESEARCH",
    "DIAGNOSE",
    "PLAN",
    "DRAFT",
    "EDIT",
    "SCORE",
    "REVISE",
    "SHIP",
    "DONE",
]


def _project_dir(slug: str) -> Path:
    return ensure_projects_dir() / slug


def _load_state(slug: str) -> dict[str, Any]:
    path = _project_dir(slug) / "state.json"
    if not path.exists():
        return {"phase": "INTAKE", "revision_count": 0, "rubric": {}, "ship_gate": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def _save_state(slug: str, state: dict[str, Any]) -> None:
    path = _project_dir(slug) / "state.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    path.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _text(content: str) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": content}]}


@tool(
    "architect_init_project",
    "Initialize a new Architect project with brief and state",
    {"name": str, "brief": str},
)
async def architect_init_project(args: dict[str, Any]) -> dict[str, Any]:
    name = args["name"]
    brief = args["brief"]
    slug = slugify(name)
    pdir = _project_dir(slug)
    pdir.mkdir(parents=True, exist_ok=True)

    (pdir / "brief.json").write_text(
        json.dumps({"name": name, "brief": brief, "created_at": datetime.now(timezone.utc).isoformat()}, indent=2),
        encoding="utf-8",
    )
    state = {
        "phase": "INTAKE",
        "revision_count": 0,
        "rubric": {},
        "ship_gate": {},
        "deliverables": [],
    }
    _save_state(slug, state)

    return _text(
        f"Project initialized: {slug}\n"
        f"Path: {pdir.relative_to(AGENT_ROOT.parent.parent)}\n"
        f"Phase: INTAKE\n"
        f"Next: RESEARCH — run VOC/diagnostics per AGENT.md task map."
    )


@tool(
    "architect_set_phase",
    "Update project workflow phase",
    {"project_slug": str, "phase": str, "notes": str},
)
async def architect_set_phase(args: dict[str, Any]) -> dict[str, Any]:
    slug = args["project_slug"]
    phase = args["phase"].upper()
    notes = args.get("notes", "")

    if phase not in PHASES:
        return _text(f"Invalid phase. Use one of: {', '.join(PHASES)}")

    state = _load_state(slug)
    state["phase"] = phase
    if notes:
        state.setdefault("phase_notes", {})[phase] = notes
    if phase == "REVISE":
        state["revision_count"] = state.get("revision_count", 0) + 1
    _save_state(slug, state)

    return _text(f"Phase set to {phase} for project '{slug}'. Revision count: {state.get('revision_count', 0)}")


@tool(
    "architect_get_context",
    "Get project brief, state, and next-step guidance",
    {"project_slug": str},
)
async def architect_get_context(args: dict[str, Any]) -> dict[str, Any]:
    slug = args["project_slug"]
    pdir = _project_dir(slug)
    if not pdir.exists():
        return _text(f"Project '{slug}' not found. Run architect_init_project first.")

    brief_path = pdir / "brief.json"
    brief = json.loads(brief_path.read_text(encoding="utf-8")) if brief_path.exists() else {}
    state = _load_state(slug)
    phase = state.get("phase", "INTAKE")

    phase_idx = PHASES.index(phase) if phase in PHASES else 0
    next_phase = PHASES[phase_idx + 1] if phase_idx + 1 < len(PHASES) else "DONE"

    artifacts = sorted(p.name for p in pdir.iterdir() if p.is_file())

    return _text(
        json.dumps(
            {
                "slug": slug,
                "brief": brief,
                "state": state,
                "current_phase": phase,
                "suggested_next_phase": next_phase,
                "artifacts": artifacts,
                "guidance": f"Complete {phase}, then move to {next_phase}. See AGENT.md workflow.",
            },
            indent=2,
        )
    )


@tool(
    "architect_save_deliverable",
    "Save a deliverable artifact to the project folder",
    {"project_slug": str, "filename": str, "content": str, "artifact_type": str},
)
async def architect_save_deliverable(args: dict[str, Any]) -> dict[str, Any]:
    slug = args["project_slug"]
    filename = args["filename"]
    content = args["content"]
    artifact_type = args.get("artifact_type", "asset")

    pdir = _project_dir(slug)
    pdir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name
    out = pdir / safe_name
    out.write_text(content, encoding="utf-8")

    state = _load_state(slug)
    deliverables = state.setdefault("deliverables", [])
    deliverables.append(
        {"filename": safe_name, "type": artifact_type, "saved_at": datetime.now(timezone.utc).isoformat()}
    )
    _save_state(slug, state)

    return _text(f"Saved {safe_name} ({artifact_type}) to project '{slug}'.")


@tool(
    "architect_list_knowledge",
    "List all Architect methodology and craft files",
    {},
)
async def architect_list_knowledge(args: dict[str, Any]) -> dict[str, Any]:
    files = sorted(p.relative_to(AGENT_ROOT.parent.parent).as_posix() for p in AGENT_ROOT.rglob("*.md"))
    return _text("Architect knowledge files:\n" + "\n".join(f"- {f}" for f in files))


@tool(
    "architect_record_rubric",
    "Record quality rubric scores for a project",
    {"project_slug": str, "scores_json": str, "average": float},
)
async def architect_record_rubric(args: dict[str, Any]) -> dict[str, Any]:
    slug = args["project_slug"]
    scores = json.loads(args["scores_json"])
    average = float(args["average"])

    state = _load_state(slug)
    state["rubric"] = {"scores": scores, "average": average, "recorded_at": datetime.now(timezone.utc).isoformat()}
    _save_state(slug, state)

    ready = average >= 8.0 and all(
        v == "N/A" or (isinstance(v, (int, float)) and v >= 6) for v in scores.values() if isinstance(v, (int, float))
    )
    return _text(f"Rubric recorded. Average: {average}. Ship ready: {ready}")


@tool(
    "architect_ship_gate",
    "Check if project is ready to ship based on state and rubric",
    {"project_slug": str},
)
async def architect_ship_gate(args: dict[str, Any]) -> dict[str, Any]:
    slug = args["project_slug"]
    state = _load_state(slug)
    rubric = state.get("rubric", {})
    average = rubric.get("average", 0)
    revision_count = state.get("revision_count", 0)
    deliverables = state.get("deliverables", [])
    phase = state.get("phase", "INTAKE")

    checks = {
        "phase_at_least_score": phase in ("SCORE", "REVISE", "SHIP", "DONE"),
        "rubric_average_gte_8": average >= 8.0,
        "has_deliverable": len(deliverables) > 0,
        "revision_limit_ok": revision_count <= 3,
    }
    ready = all(checks.values()) or (revision_count > 3 and checks["has_deliverable"])

    return _text(
        json.dumps(
            {
                "ready": ready,
                "checks": checks,
                "phase": phase,
                "rubric_average": average,
                "revision_count": revision_count,
                "deliverables": deliverables,
            },
            indent=2,
        )
    )


@tool(
    "architect_get_memory",
    "Get recent headline learnings, memory stats, and craft insights",
    {"limit": int, "source": str},
)
async def architect_get_memory(args: dict[str, Any]) -> dict[str, Any]:
    limit = int(args.get("limit", 20))
    source = args.get("source") or None
    if source == "":
        source = None

    store = MemoryStore()
    store.ensure_dirs()
    recent = store.get_recent_swipes(limit=limit, source=source)
    stats = store.get_stats()

    insights_path = store.root / "insights.jsonl"
    insights: list[dict[str, Any]] = []
    if insights_path.exists():
        for line in insights_path.read_text(encoding="utf-8").splitlines()[-10:]:
            if line.strip():
                insights.append(json.loads(line))

    return _text(
        json.dumps(
            {
                "stats": stats,
                "recent_swipes": recent,
                "recent_insights": insights,
                "digest_file": "agents/the-architect/memory/digest.md",
            },
            indent=2,
        )
    )


@tool(
    "architect_record_insight",
    "Record a craft insight for continuous improvement (post-SHIP learning)",
    {"category": str, "insight": str, "project_slug": str},
)
async def architect_record_insight(args: dict[str, Any]) -> dict[str, Any]:
    category = args["category"]
    insight = args["insight"]
    project_slug = args.get("project_slug") or None

    store = MemoryStore()
    store.record_insight(category=category, insight=insight, project_slug=project_slug)
    return _text(f"Insight recorded under '{category}'.")


@tool(
    "architect_run_daily_learning",
    "Run daily headline swipe collection from Buzzhead, Cosmo, Enquirer, proven headlines, and sales letters",
    {"limit_per_source": int},
)
async def architect_run_daily_learning(args: dict[str, Any]) -> dict[str, Any]:
    limit = int(args.get("limit_per_source", 15))
    summary = run_daily_learning(limit_per_source=limit)
    return _text(format_summary(summary))


def create_architect_mcp_server():
    return create_sdk_mcp_server(
        name="architect",
        version="1.0.0",
        tools=[
            architect_init_project,
            architect_set_phase,
            architect_get_context,
            architect_save_deliverable,
            architect_list_knowledge,
            architect_record_rubric,
            architect_ship_gate,
            architect_get_memory,
            architect_record_insight,
            architect_run_daily_learning,
        ],
    )


ARCHITECT_TOOL_NAMES = [
    "mcp__architect__architect_init_project",
    "mcp__architect__architect_set_phase",
    "mcp__architect__architect_get_context",
    "mcp__architect__architect_save_deliverable",
    "mcp__architect__architect_list_knowledge",
    "mcp__architect__architect_record_rubric",
    "mcp__architect__architect_ship_gate",
    "mcp__architect__architect_get_memory",
    "mcp__architect__architect_record_insight",
    "mcp__architect__architect_run_daily_learning",
]
