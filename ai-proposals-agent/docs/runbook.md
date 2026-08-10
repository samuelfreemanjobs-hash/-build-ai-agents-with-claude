# AI Proposals Agent™ — Operator Runbook

**Version:** 2.0.0 — aligned with S0–S6 sequential pipeline and T0–T3 tiering

## Pre-run checklist

1. Confirm `kb/certifications.json` refreshed (ISO, CTPAT, insurance)
2. Confirm cost rows exist in `kb/cost-tables/` for every scoped service line
3. Upload RFP via intake (G1) or paste text for demo runs
4. Answer three intake questions (Q1–Q3 in `agent/DUTIES.md`)

## Tier reference

| Tier | Evaluator | Human gate |
|---|---|---|
| T0 | none | none (pricing approval still recommended) |
| T1 | advisory, 1 pass | pricing approval |
| T2 | advisory, 1 pass | pricing + compliance review |
| T3 | up to 2 narrative regen cycles | full document review, mandatory |

Commands: `*tier` restates current tier and active gates.

## Run states

| State | Operator action |
|---|---|
| `INTAKE_REVIEW` | Confirm scope, tier, gap preview from Q3 |
| `PRICING_REVIEW` | Select Competitive / Balanced / Premium scenario |
| `DRAFT_REVIEW` | Read compliance gaps; edit narrative only (not numbers) |
| `COMPLETED` | Export (G2 DOCX pending) |
| `HALTED` | See halt cause; fix KB or intake; re-run from failed stage |
| `FAILED` | Check run log; untraceable numerics or schema violation |

## Stage pipeline

```
S0 Intake → S1 Compliance → S2 Case studies → S3 Pricing →
S4 Assembly → S5 Evaluator → S6 Emit
```

Each stage must emit schema-valid output before the next begins. See
`agent/system-prompt.md` for halt conditions per stage.

## Halt causes & fix paths

### NON_OVERRIDABLE (deterministic gates)

| Cause | Stage | Fix |
|---|---|---|
| Missing cost row | S3 | Add row to `kb/cost-tables/` |
| Volume out of band | S3 | Add validated cost row for volume band |
| Untraceable numeric | S4/S5 | Remove figure or add source binding |
| Schema violation (2nd fail) | Any | Fix input records, rerun stage |
| Run log write failure | S6 | Fix filesystem permissions / path |

### Overridable (with documented justification)

| Cause | Fix |
|---|---|
| Zero eligible case studies | Expand KB or proceed without case section |
| Credential expiring mid-term | Renew cert OR document gap with remediation date |

## Changing a price

**Never edit price fields in the console or prose.**

1. Change engine input (volume, service line, margin tier)
2. Re-run `scripts/pricing_engine.py` or S3 stage
3. Human-approve new scenario
4. Regenerate pricing narrative + downstream sections only

## Audit commands

| Command | Purpose |
|---|---|
| `*trace <field>` | Resolve any deliverable value to source record |
| `*gaps` | Current compliance gap list with mitigations |
| `*halt` | Operator-initiated stop with reason logged |

## QA interpretation

- **Overall score = minimum** of six dimensions
- Low compliance + high writing → **KB gap**, not bad prose
- CRITICAL defects on Tier 3: max 2 narrative regeneration cycles, then HALT
- Evaluator never regenerates pricing or compliance — fix records, rerun stage

## SLO targets (pre-production)

| Metric | Target |
|---|---|
| p95 wall-clock (T1 RFQ) | < 15 minutes |
| p95 wall-clock (T3 RFP) | < 45 minutes |
| Component self-test pass | 100% before any deploy |

Breaches attributed to sequential dependency (not model latency) are an
ADR-001 escalation trigger — see §5.

## Post-run

1. Verify run log entry in `.ai/data/proposal-runs.jsonl`
2. Archive deliverable with output header intact
3. Attach final approved DOCX when G2 live
4. Feed win/loss outcome back to KB for case study updates

## Quick verify

```bash
python3 scripts/run_golden_tests.py
python3 scripts/token_economics.py
cd backend && python3 -m pytest tests/ -v
```

## Remaining blockers

| ID | Blocker |
|---|---|
| G1 | PDF/DOCX RFP ingest |
| G2 | Branded DOCX export |
| G7 | Golden fixture population |
| G8 | NDA retention enforcement |

See [`known-gaps.md`](known-gaps.md) and [`fallback-playbook.md`](fallback-playbook.md).
