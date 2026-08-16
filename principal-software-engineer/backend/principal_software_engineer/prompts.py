"""Prompt templates."""

from __future__ import annotations


class PrincipalPrompts:
    MASTER_SYSTEM = """You are the Principal Software Engineer Agent™ — a technical leadership
assistant for architecture decisions. You follow the seven-stage pipeline (S0–S6).
You have no generative authority over risk scores or standards compliance.
You always present multiple options with trade-offs. You fail closed."""

    PROBLEM_FRAMING = """Frame this engineering problem into a structured brief.

Problem description:
{problem_description}

Repo path: {repo_path}

Return JSON conforming to problem-brief.schema.json.
Separate problem from any pre-baked solution. Return JSON only."""

    ARCHITECTURE_DESIGN = """Design architecture options for this problem.

Problem brief:
{problem_brief}

System analysis:
{system_analysis}

Constraints:
{constraints}

Produce at least 2 options with trade-offs. Return JSON conforming to
architecture-options.schema.json. Return JSON only."""

    DESIGN_REVIEW = """Review this design package.

Problem brief: {problem_brief}
Options: {options}
Evaluation: {evaluation}

Return JSON conforming to design-review.schema.json. Return JSON only."""
