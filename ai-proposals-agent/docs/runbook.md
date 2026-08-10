# AI Proposals Agent™ — Operator Runbook

## Pre-run checklist

1. Confirm KB credentials table refreshed (ISO, CTPAT, insurance)  
2. Confirm pricing model has cost rows for proposed service lines  
3. Upload RFP via intake (G1) or paste text for demo runs  
4. Set customer profile (industry, corridor, mode)  

## Run states

| State | Operator action |
|-------|-----------------|
| `INTAKE_REVIEW` | Confirm scope, exclusions, deadline |
| `PRICING_REVIEW` | Select Competitive / Balanced / Premium |
| `DRAFT_REVIEW` | Read compliance gaps; edit narrative only (not numbers) |
| `COMPLETED` | Export (G2 pending) |
| `HALTED` | See cause tab; fix KB or intake; re-run |
| `FAILED` | Check run log; untraceable numerics or schema violation |

## Halt causes & fix paths

### NON_OVERRIDABLE (G07 — enforce in code)

| Cause | Fix |
|-------|-----|
| `MISSING_COST_ROW` | Add row to `pricing_models` for service line + lane band |
| `VOLUME_OUT_OF_BAND` | Exec approval for out-of-band volume OR adjust RFP volume assumption |
| `UNTRACEABLE_NUMERIC` | Remove or replace figure; re-run engine + generation |

### Overridable (with documentation)

| Cause | Fix |
|-------|-----|
| `CREDENTIAL_EXPIRED` | Renew cert OR exclude claim with waiver note |
| `RFP_AMBIGUOUS_SCOPE` | Operator adds scope clarification to intake record |

## Changing a price

**Never edit price fields in the console.**

1. Change engine input (volume, service line, margin tier)  
2. Re-run pricing phase  
3. Human-approve new scenario  
4. Regenerate pricing narrative + downstream sections  

## Override workflow

Overrides require:
- `override_cause` (must not be in NON_OVERRIDABLE set)
- `operator_id`
- `rationale` (min 20 chars)
- `timestamp`

Logged in run trace; visible in audit export.

## QA interpretation

- **Overall score = minimum** of six dimensions  
- Low compliance coverage with high writing scores → **KB gap**, not bad prose  
- Recommendation card should say: *"Score reflects knowledge-base state, not writing quality."*

## Post-run

1. Archive run log JSON  
2. Attach final approved PDF/DOCX when G2 live  
3. Feed win/loss outcome back to KB for case study updates  

## Remaining blockers

| ID | Blocker | Notes |
|----|---------|-------|
| G1 | Document ingestion | Pick library after one real RFP |
| G2 | DOCX export | Style template from winning proposal |
| G07 | NON_OVERRIDABLE in halt handler | Docs-only today — add frozenset + golden test |
