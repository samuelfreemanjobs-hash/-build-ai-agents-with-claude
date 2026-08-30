# {{AGENT_NAME}} — Agent Orchestration

**Archetype:** {{ARCHETYPE}}

## Workflow

```
INTAKE → RESEARCH → DIAGNOSE → PLAN → DRAFT → EDIT → SCORE → [REVISE] → SHIP
```

| Phase | Job |
|---|---|
| INTAKE | Parse brief; confirm avatar, offer, metric |
| RESEARCH | VOC, competitive, memory |
| DIAGNOSE | Task templates per archetype |
| PLAN | Big idea, hook, deliverables |
| DRAFT | Primary asset |
| EDIT | EDITOR-PASSES.md |
| SCORE | QUALITY-RUBRIC.md ≥ 8.0 |
| SHIP | Deliverables + diagnostic summary |

## Stop conditions

- Rubric average ≥ **8.0**, no dimension < 6
- Max **3** revision loops

## Task router

| Task | Diagnostics |
|---|---|
| *(define per agent)* | |

## Tools (implement in runtime)

| Tool | Purpose |
|---|---|
| `init_project` | Create project + brief.json + state.json |
| `set_phase` | Update workflow phase |
| `get_context` | Brief + state + next step |
| `save_deliverable` | Save artifact |
| `ship_gate` | Verify ready to ship |
