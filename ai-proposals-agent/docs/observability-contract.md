# Observability Contract

**Version:** 2.0.0  
**Applies to:** All proposal runs (S0–S6)

Every run must be auditable by an operator who was not present during
generation. This document defines what is logged, where, and how `*trace`
resolves.

---

## Run log (canonical)

**Path:** `.ai/data/proposal-runs.jsonl` (see `agent/core-config.xml`)

One JSON object per line. Append-only. Conforms to `schemas/run-log.schema.json`.

### Required fields (every run)

| Field | Description |
|---|---|
| `run_id` | Unique identifier, format `run_YYYY-MM-DD_NNN` |
| `outcome` | `INTAKE_REVIEW`, `PRICING_REVIEW`, `DRAFT_REVIEW`, `COMPLETED`, `HALTED`, `FAILED` |
| `human_review_required` | Always `true` |
| `tier` | T0–T3 from intake |
| `created_at` | ISO 8601 UTC |
| `stage_timings_ms` | Per-stage wall clock when `emit_stage_timings` enabled |
| `skills_loaded` | Skill names loaded during run |
| `token_counts` | Input/output tokens per stage when enabled |

### Traceability block

```json
"traceability": {
  "untraceable_count": 0,
  "bindings": [
    {
      "field": "pricing.balanced.total_price",
      "value": "396000.00",
      "source_type": "script",
      "source_ref": "scripts/pricing_engine.py#balanced.total_price",
      "stage": "S3"
    }
  ]
}
```

**COMPLETED** requires `untraceable_count == 0`.

### HALT runs

Must include:
- `halt_cause` — named cause from deterministic gate or schema validation
- `halt_stage` — S0–S6 where halt occurred
- `operator_action` — specific record or field needed to proceed

---

## Output header (deliverable)

Every deliverable opens with the header block defined in `agent/DUTIES.md`.
The header is the human-readable summary of the run log. Fields must match
log values — mismatches are CRITICAL defects.

---

## Stage observability

When `emit_stage_timings` is true:

| Stage | Logged events |
|---|---|
| S0 | Extraction complete, tier assigned, gap preview emitted |
| S1 | Validator version, n_compliant, n_gap, n_mandatory_gap |
| S2 | Scorer version, selected case IDs, halt if zero eligible |
| S3 | Engine version, recommended scenario, pricing hash |
| S4 | Sections assembled, word/page counts |
| S5 | QA scores, defect count by severity, evaluator cycles used |
| S6 | Log write confirmation, output path |

---

## `*trace` command contract

Operator invokes `*trace <field>` to resolve any value in the deliverable.

Response format:

```
FIELD:    pricing.balanced.total_price
VALUE:    396000.00
STAGE:    S3 — Pricing
SOURCE:   scripts/pricing_engine.py
REF:      kb/cost-tables/warehousing.csv#L14 (WHSE_PALLET unit_cost)
```

If resolution fails → defect in the system, not operator error.

---

## Redaction

When `redact_client_names_in_log` is true:
- Client names in case studies without `release_flag` are replaced with `[REDACTED]` in logs
- RFP source text is never logged verbatim — only hashes and source refs
- Certificate numbers are logged (needed for audit)

---

## Retention (specified, not yet enforced)

See `core-config.xml`:
- RFP source TTL: 30 days
- Run log TTL: 730 days
- `use_for_model_training`: false

Enforcement is **G8** — must be implemented before accepting NDA-covered documents.

---

## Backend integration

The FastAPI layer (`backend/ai_proposals_agent/`) emits compatible run logs via
`RunLogBuilder`. Production agent runs should write to the same JSONL path or
a Postgres mirror in phase 2.

---

## Verification

```bash
python3 scripts/run_golden_tests.py   # component self-tests
python3 -m pytest backend/tests/ -v   # integration tests
```

Golden case **G23** asserts header completeness and human review line on all tiers.
