# Marketing Agent Build — [Agent Name]

**Date:**  
**Archetype:** ☐ copy_chief ☐ headline_smith ☐ funnel_architect ☐ email_sequencer ☐ voc_researcher ☐ offer_engineer ☐ content_factory ☐ launch_orchestrator ☐ brand_strategist ☐ cro_auditor ☐ kindle_author ☐ ads_scriptwriter ☐ router

Save to `projects/<slug>/diagnostics/` or `agents/<agent-slug>/`.

---

## 1. Brief

| Field | Answer |
|---|---|
| **Agent name** | |
| **One-sentence job** | |
| **Target user** (operator) | |
| **End customer avatar** | |
| **Primary metric** | |
| **Channels** | |
| **Constraints** (compliance, brand) | |

---

## 2. Archetype & scope

| Field | Spec |
|---|---|
| **Archetype** | |
| **In scope** | |
| **Out of scope** | |
| **Hybrid / router?** | ☐ No ☐ Yes — routes to: |

**Galactic phases used:** ☐ 1 ☐ 2 ☐ 3 ☐ 4 ☐ 5 ☐ 6 ☐ 7 ☐ 8 ☐ 9 ☐ 10

---

## 3. Topology

**Pattern:** ☐ Single ☐ Sequential pipeline ☐ Evaluator-optimizer ☐ Router

```
[Diagram]
```

| Node | Role | Tools |
|---|---|---|
| | | |

---

## 4. Workflow (state machine)

| Phase | Job | Exit gate |
|---|---|---|
| INTAKE | | |
| RESEARCH | | |
| DIAGNOSE | | |
| PLAN | | |
| DRAFT | | |
| EDIT | | |
| SCORE | | |
| SHIP | | |

**Max revision loops:** 3

---

## 5. Prompt load order

| # | File | Purpose |
|---|---|---|
| 1 | | Apex |
| 2 | | Operations |
| 3 | | SYSTEM |
| 4 | | AGENT |

**Estimated token budget:** ___

---

## 6. Tools spec

| Tool name | Parameters | Returns | Fallback |
|---|---|---|---|
| init_project | | | |
| set_phase | | | |
| get_context | | | |
| save_deliverable | | | |
| ship_gate | | | |
| | | | |

---

## 7. Knowledge / methodology map

| Task type | Files to load |
|---|---|
| | |

---

## 8. Output contract

Every job delivers:

1.  
2.  
3.  

**Rubric minimum:** ☐ 8.0 avg, no dim < 6

---

## 9. Scaffold manifest

| Path | Status |
|---|---|
| `agents/<slug>/README.md` | ☐ |
| `agents/<slug>/SYSTEM.md` | ☐ |
| `agents/<slug>/AGENT.md` | ☐ |
| `agents/<slug>/INVOCATION.md` | ☐ |
| `agents/<slug>/QUALITY-RUBRIC.md` | ☐ |
| Python package (optional) | ☐ |

---

## 10. Agent builder audit

- [ ] Archetype + metric locked
- [ ] Workflow + ship gate documented
- [ ] Tools minimum set defined
- [ ] Load order ≤ 4 apex files
- [ ] Sample task passed rubric
- [ ] README run instructions complete

**Build audit score (1–10):** ___
