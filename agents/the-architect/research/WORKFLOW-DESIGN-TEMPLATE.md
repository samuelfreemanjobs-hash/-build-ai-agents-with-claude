# Workflow Design — [Project Name]

**Date:**  
**Paired framework:** [name or N/A]  
**Type:** ☐ Creation ☐ Audit ☐ Launch ☐ Build ☐ Recurring (daily/weekly)

Save to `projects/<slug>/diagnostics/`.

---

## 1. Trigger & Outcome

| Item | Definition |
|---|---|
| **Trigger** (what starts this workflow) | |
| **Definition of done** (measurable) | |
| **Primary owner** | |
| **Typical duration** | |
| **Agent-compatible?** | ☐ Yes — map to `architect_set_phase` ☐ No — human only |

---

## 2. Phase Map (3–9 phases)

| Phase | Name | Owner | Max revision loops |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |

**Parent workflow (if sub-workflow):**  
**Child sub-workflows linked:**

---

## 3. Phase Detail

### Phase 1: [Name]

| Item | Spec |
|---|---|
| **Inputs required** | |
| **Steps (checklist)** | ☐ 1. ☐ 2. ☐ 3. |
| **Outputs produced** | |
| **Save location** | |
| **Exit gate** (must pass to advance) | |
| **Leading metric** | |
| **Lagging metric** | |

### Phase 2: [Name]

| Item | Spec |
|---|---|
| **Inputs required** | |
| **Steps (checklist)** | |
| **Outputs produced** | |
| **Save location** | |
| **Exit gate** | |
| **Leading metric** | |
| **Lagging metric** | |

### Phase 3: [Name]

| Item | Spec |
|---|---|
| **Inputs required** | |
| **Steps (checklist)** | |
| **Outputs produced** | |
| **Save location** | |
| **Exit gate** | |
| **Leading metric** | |
| **Lagging metric** | |

*(Duplicate Phase blocks as needed — or attach separate doc per phase for 6+ phases)*

---

## 4. Framework ↔ Workflow Map

| Framework part | Workflow phase(s) | Micro-win delivered |
|---|---|---|
| | | |
| | | |
| | | |

**Every framework part has ≥1 workflow step?** ☐ Yes ☐ Gap: ___  
**Every workflow phase maps to framework or bookend?** ☐ Yes ☐ Orphan: ___

---

## 5. Handoffs & Dependencies

| From phase | To phase | Handoff artifact | Blocker if missing |
|---|---|---|---|
| | | | |
| | | | |

---

## 6. Quality & Revision

| Rule | Value |
|---|---|
| Max REVISE loops | ☐ 3 (default) ☐ Other: ___ |
| Editor passes required | ☐ All 6 (`EDITOR-PASSES.md`) |
| Rubric minimum | ☐ 8.0 avg, no dim < 6 |
| Terminal ship gate | ☐ `SYSTEM.md` + task-specific |

---

## 7. Diagram (optional)

**Swimlane / pipeline spec:**

```
[Trigger] → Phase 1 → [Gate] → Phase 2 → … → [SHIP]
```

---

## 8. Workflow Audit (ship gate)

- [ ] Trigger + definition of done explicit
- [ ] 3–9 phases with exit gates
- [ ] Inputs/outputs per phase
- [ ] Owner per phase
- [ ] Metrics (leading + lagging)
- [ ] Sub-workflows linked, not duplicated
- [ ] Revision cap documented
- [ ] Terminal rubric gate
- [ ] Framework map complete (if paired)

**Workflow audit score (1–10):** ___
