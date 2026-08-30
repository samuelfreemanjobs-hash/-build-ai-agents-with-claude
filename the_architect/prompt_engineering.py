"""God of Prompts — prompt engineering utilities for The Architect runtime."""

from __future__ import annotations

import json
from typing import Any

# Reconsideration red flags (late = regenerate with tighter constraints)
RECONSIDERATION_RED_FLAGS = (
    "actually…",
    "actually...",
    "let me reconsider",
    "i may have overcounted",
    "wait, on reflection",
    "on second thought",
)

# Token budget guidance (60% Rule — Principle #08)
TIER_TOKEN_BUDGETS: dict[str, int] = {
    "T1": 500,
    "T2": 1200,
    "T3": 4000,
    "T4": 8000,
}

TIER_WORD_HINTS: dict[str, str] = {
    "T1": "3–12 words or 1–3 lines",
    "T2": "40–150 words",
    "T3": "500–3,000 words",
    "T4": "3,000+ words",
}


def detect_reconsideration_red_flags(text: str) -> list[str]:
    """Return matched red-flag phrases found in output."""
    lower = text.lower()
    return [flag for flag in RECONSIDERATION_RED_FLAGS if flag in lower]


def token_budget_for_tier(tier: str) -> int:
    return TIER_TOKEN_BUDGETS.get(tier.upper(), TIER_TOKEN_BUDGETS["T3"])


def word_hint_for_tier(tier: str) -> str:
    return TIER_WORD_HINTS.get(tier.upper(), TIER_WORD_HINTS["T3"])


def wrap_xml(tag: str, content: str, *, indent: int = 0) -> str:
    pad = "  " * indent
    inner = content.strip()
    if "\n" in inner:
        lines = [f"{pad}  {line}" if line else f"{pad}" for line in inner.splitlines()]
        return f"{pad}<{tag}>\n" + "\n".join(lines) + f"\n{pad}</{tag}>"
    return f"{pad}<{tag}>{inner}</{tag}>"


def build_xml_prompt(
    *,
    context: str,
    role: str,
    instructions: str,
    constraints: str,
    variables: dict[str, str] | None = None,
    document: str | None = None,
    deliverables: str | None = None,
) -> str:
    """Build Claude-native XML-zoned prompt (Principle #03)."""
    parts: list[str] = [
        wrap_xml("context", context),
        "",
        wrap_xml("role", role),
    ]
    if variables:
        var_lines = "\n".join(f"{k}: {v}" for k, v in variables.items())
        parts.extend(["", wrap_xml("variables", var_lines)])
    if document:
        parts.extend(["", wrap_xml("document", document)])
    parts.extend(
        [
            "",
            wrap_xml("instructions", instructions),
            "",
            wrap_xml("constraints", constraints),
        ]
    )
    if deliverables:
        parts.extend(["", wrap_xml("deliverables", deliverables)])
    return "\n".join(parts)


def build_three_layer_prompt(
    *,
    layer1_identity: str,
    layer2_session: str,
    layer3_task: str,
    use_xml: bool = True,
) -> str:
    """Three-layer structure (Principle #11)."""
    if use_xml:
        return build_xml_prompt(
            context=f"{layer1_identity.strip()}\n\n--- Session ---\n{layer2_session.strip()}",
            role="The Architect — one voice, no modes. See SYSTEM.md.",
            instructions=layer3_task.strip(),
            constraints=(
                "Follow GOD-OF-PROMPTS-METHODOLOGY.md. "
                "Proof or [PROOF NEEDED]. No filler. Match tier token budget."
            ),
        )
    return (
        f"## Layer 1 — Identity\n{layer1_identity.strip()}\n\n"
        f"## Layer 2 — Session\n{layer2_session.strip()}\n\n"
        f"## Layer 3 — Task\n{layer3_task.strip()}"
    )


def build_factory_prompt(
    *,
    mission: str,
    role: str,
    tier: str,
    variables: dict[str, str],
    workflow_steps: list[str],
    deliverables: list[str],
    extra_constraints: str | None = None,
) -> str:
    """Standard factory envelope with God of Prompts zoning."""
    budget = token_budget_for_tier(tier)
    word_hint = word_hint_for_tier(tier)
    constraints = [
        f"Tier {tier.upper()}: target {word_hint}; max ~{budget} tokens output.",
        "One voice (SYSTEM.md). Run self-critique for T3+ before ship.",
        "God of Prompts: XML zones, 60% Rule, no reconsideration spiral.",
        "Proof or [PROOF NEEDED]. Never skip EDITOR-PASSES + QUALITY-RUBRIC ≥ 8.0.",
    ]
    if extra_constraints:
        constraints.append(extra_constraints)

    instructions = "\n".join(f"{i + 1}. {step}" for i, step in enumerate(workflow_steps))
    deliverable_text = "\n".join(f"- {d}" for d in deliverables)

    return build_xml_prompt(
        context=f"Production factory run. Mission: {mission}",
        role=role,
        variables=variables,
        instructions=instructions,
        constraints="\n".join(f"- {c}" for c in constraints),
        deliverables=deliverable_text,
    )


def state_compaction_schema() -> dict[str, Any]:
    """JSON schema for state compaction (Principle #09)."""
    return {
        "original_goal": "",
        "project_slug": "",
        "current_phase": "",
        "active_constraints": [],
        "completed_milestones": [],
        "open_questions": [],
        "next_action_required": "",
        "token_budget_tier": "T3",
    }


def format_compacted_state(state: dict[str, Any]) -> str:
    return wrap_xml("session_state", json.dumps(state, indent=2))


def critique_prompt_for_draft(draft: str, *, tier: str = "T3") -> str:
    """Self-criticism engine prompt (Chain 1 Step 2)."""
    return build_xml_prompt(
        context="Self-Critique QC — Chain 1 Step 2. Find every flaw before ship.",
        role=(
            "Harsh DR editor. Specific critiques only. "
            "5–7 flaws minimum. Rank top 3 by revenue impact."
        ),
        document=draft,
        instructions=(
            "1. List flaws with why each fails for the avatar\n"
            "2. Scan for reconsideration red flags\n"
            "3. Check awareness match, mechanism, CTA, one voice"
        ),
        constraints=f"Max 800 words. Tier {tier}. No polite padding.",
        deliverables="Brutal Critique list + top 3 fixes ranked",
    )


def refine_prompt_for_draft(draft: str, critique: str, *, tier: str = "T3") -> str:
    """Final polish prompt (Chain 1 Step 3)."""
    budget = token_budget_for_tier(tier)
    return build_xml_prompt(
        context="Self-Critique QC — Chain 1 Step 3. Rewrite from scratch.",
        role="Elite copy chief synthesizing draft + critique into ship-ready asset.",
        document=f"Draft:\n{draft}\n\nCritique:\n{critique}",
        instructions=(
            "1. Rewrite completely — do not patch\n"
            "2. Address every critique point\n"
            "3. One voice throughout\n"
            "4. Proceed to EDITOR-PASSES + rubric"
        ),
        constraints=f"Tier {tier}. Max ~{budget} tokens. Proof or [PROOF NEEDED].",
        deliverables="Final asset + 3 bullets on what changed",
    )


def technique_for_task(task_type: str) -> str:
    """Google × God of Prompts technique router."""
    key = task_type.lower().replace(" ", "_")
    router = {
        "headline": "zero-shot + few-shot variants; T1 budget; no CoT",
        "classification": "zero-shot; temp=0; JSON output",
        "sales_page": "few-shot structure + self-critique chain; T3 budget",
        "email": "few-shot + self-critique; T2-T3 budget",
        "strategy": "step-back + epistemic architect; T4 budget",
        "research": "ReAct/tools + XML constraints; cite sources",
        "agent_prompt": "XML constraint chain (audit → architect)",
        "book_chapter": "few-shot voice anchors + T4 budget; cliffhanger end",
        "launch": "multi-phase chain; state compaction every 10 turns",
    }
    for prefix, technique in router.items():
        if prefix in key:
            return technique
    return "three-layer + XML zones; match tier budget"
