# Fallback Playbook

**Version:** 2.0.0  
**Trigger:** Primary model unavailable, rate limited, or quality degradation detected

---

## Model fallback chain

Defined in `agent/core-config.xml`:

| Role | Model | Trigger |
|---|---|---|
| Primary | `claude-opus-4-5` | Default for narrative, extraction, evaluation |
| Fallback | `claude-sonnet-4-5` | `primary_unavailable` |

**VERIFY_BEFORE_USE:** Confirm model IDs against current Anthropic API listing
before production deploy.

---

## When to fallback

| Condition | Action |
|---|---|
| Primary returns 503/529 | Retry once after 30s, then fallback |
| Primary rate limited (429) | Exponential backoff (max 3 retries), then fallback |
| Primary timeout (>120s on single stage) | Log, retry once, then fallback |
| Operator explicitly requests fallback | Switch for remainder of run |

---

## What fallback does NOT change

Fallback model switch affects **narrative stages only** in terms of quality
expectations. These are unchanged regardless of model:

- `scripts/pricing_engine.py` — deterministic
- `scripts/compliance_validator.py` — deterministic
- `scripts/case_study_scorer.py` — deterministic
- HALT rules, tier gates, schema validation
- Human review requirement on every deliverable

**Never** ask the fallback model to compute prices or determine compliance.

---

## Quality degradation detection

If fallback produces:
- Schema validation failure on first attempt → retry once with structured output prompt
- Second schema failure → HALT (R8 in DUTIES.md)
- QA score below tier minimum after evaluator → HALT or operator review

Log `model_used` and `fallback_triggered: true` in run log.

---

## Manual fallback (DFY tier)

When the automated pipeline is unavailable:

1. Run deterministic scripts locally:
   ```bash
   python3 scripts/pricing_engine.py --scope scope.json --costs costs.json
   python3 scripts/compliance_validator.py --selftest  # verify validator OK
   ```
2. Use Claude in chat with `agent/system-prompt.md` + relevant skill
3. Transcribe script outputs verbatim — do not recompute
4. Write run log entry manually to `.ai/data/proposal-runs.jsonl`
5. Mark deliverable with human review header

This path requires none of the Docker/AWS infrastructure.

---

## Recovery

After fallback run completes:
1. Archive run log with `fallback: true` flag
2. If primary recovers mid-run, do not switch models mid-stage — finish stage on current model
3. Post-incident: update `LAST_VERIFIED` in `token_economics.py` if rate card changed during outage

---

## Escalation

If both primary and fallback fail:
- HALT with cause `MODEL_UNAVAILABLE`
- Operator completes manually (DFY workflow)
- Do not deliver unlogged output
