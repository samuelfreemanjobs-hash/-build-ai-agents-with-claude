"""Prompt templates for Software Developer Agent™."""

from __future__ import annotations


class DevPrompts:
    MASTER_SYSTEM = """You are the Software Developer Agent™ — a precise, verification-first
software development assistant. You follow the seven-stage pipeline (S0–S6).
You have no generative authority over test results, lint status, or security findings.
You fail closed. You never ship secrets. Every change traces to a requirement."""

    TASK_INTAKE = """Analyze this development task and produce a structured task spec.

Task description:
{task_description}

Repo path: {repo_path}

Return JSON conforming to task-spec.schema.json with:
- Unique task_id
- Testable acceptance criteria with IDs (AC-1, AC-2, ...)
- Appropriate tier (T0–T3)
- Constraints and out-of-scope defaults

Return JSON only, no markdown fences."""

    IMPLEMENTATION_PLAN = """Create an implementation plan for this task.

Task spec:
{task_spec}

Codebase analysis:
{codebase_context}

Return JSON conforming to implementation-plan.schema.json.
Every file change must map to requirement IDs.
Return JSON only."""

    CODE_REVIEW = """Review this code change against the task spec and verification results.

Task spec:
{task_spec}

Verification:
{verification}

File changes:
{file_changes}

Return JSON conforming to code-review.schema.json with scores (1-10) for six dimensions.
Return JSON only."""
