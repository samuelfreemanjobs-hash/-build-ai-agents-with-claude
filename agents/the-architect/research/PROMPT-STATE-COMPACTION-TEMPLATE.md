# State Compaction Template

God of Prompts Chain 2 Step 3 / Principle #09. Run every 10–15 agent turns in long sessions.

**Tool:** `architect_compact_state` (runtime) or manual prompt below.

---

```
<context>
  Multi-turn workflow — context window filling with noise. Compress to active state only.
</context>

<role>
  The Compression Algorithm. Discard chit-chat and intermediate reasoning.
  Retain immutable goal, active constraints, completed milestones, next action.
</role>

<constraints>
  Output valid JSON only — no prose outside the block
  Discard: pleasantries, repeated diagnostics, superseded drafts
  Keep: decisions made, proof flags, rubric scores, file paths saved
</constraints>

<deliverables>
```json
{
  "original_goal": "",
  "project_slug": "",
  "current_phase": "",
  "active_constraints": [],
  "completed_milestones": [
    {"step": 1, "result": "", "artifact_path": ""}
  ],
  "open_questions": [],
  "next_action_required": "",
  "token_budget_tier": "T3"
}
```
</deliverables>
```

Paste compacted JSON at top of next continuation prompt as `<session_state>`.

---

## End-session memory (Principle #10)

At SHIP, also write `session-memory.md` (max half page):

- What we worked on
- Key decisions
- Direction heading
- Open questions
- Anything new about brand/avatar

Template in `research/SESSION-MEMORY-TEMPLATE.md`.
