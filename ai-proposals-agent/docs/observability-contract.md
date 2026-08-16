# Observability Contract

Three surfaces. All three are mandatory; a run missing any of them is a
failed run regardless of output quality.

## 1. Run log — `.ai/data/proposal-runs.jsonl`

One line per run, conforming to `schemas/run-log.schema.json`. Append-only.

Two invariants enforced by the schema itself:

- `human_review_required` is `const: true`. There is no serialization of a
  run that claims submission-readiness.
- `outcome: COMPLETED` requires `traceability.untraceable_count == 0`. A run
  that emitted a number it cannot resolve to a source cannot be logged as
  completed. It logs as `FAILED`.

The second one is the point of the whole system. It is enforced at the
schema layer specifically so it cannot be waived by prompt drift.

## 2. Output header

Rendered at the top of every deliverable, every tier. Fields defined in
DUTIES.md. The header exists so that a document detached from this system —
forwarded, printed, pasted into email — still carries its provenance and
its review requirement.

## 3. `*trace <field>` — the audit primitive

Given any value in a deliverable, returns:

```
field:          pricing.total_price
value:          396000.00
produced_by:    pricing_engine 2.0.0 (S3)
inputs:         scope[2 lines], cost-tables/warehousing.csv#L14,
                cost-tables/fulfillment.csv#L7
margin_policy:  balanced (0.25, on price)
run_id:         RUN-20260810-142233-9c1ab4e7
```

If `*trace` cannot resolve a field, that is a defect in this system. It is
not an acceptable limitation and it is not closed as "won't fix."

## What is deliberately NOT logged

- Full RFP source text. NDA exposure with no observability benefit; the
  `kb_snapshot_hash` plus retained source under TTL is sufficient for
  reproduction.
- Client names, when `redact_client_names_in_log` is true. `client_ref` is
  an opaque handle resolvable only against the operator's own records.
- Model reasoning traces. High volume, low diagnostic value relative to
  stage timings plus defect codes.

## Reading the log

Mandatory-gap rate across runs:

```bash
jq -s 'map(select(.outcome=="COMPLETED"))
       | map(.compliance.n_mandatory_gap) | add / length' \
  .ai/data/proposal-runs.jsonl
```

Halt causes ranked — this is the KB-maturity signal:

```bash
jq -r 'select(.outcome=="HALTED") | .halt.cause' \
  .ai/data/proposal-runs.jsonl | sort | uniq -c | sort -rn
```

`KB_COVERAGE_GAP` and `MISSING_COST_ROW` dominating means the knowledge
base is underpopulated, not that the agent is broken. Those halts are the
system working.

Token drift against the ADR-001 assumption:

```bash
jq -s 'map(.tokens.input) | add / length' .ai/data/proposal-runs.jsonl
```

If measured input tokens diverge more than 25% from
`SINGLE_AGENT_TOKENS` in `token_economics.py`, update the constant and
re-run the cost gate. The ADR's arithmetic is only as good as its inputs.
