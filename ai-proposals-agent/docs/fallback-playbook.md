# Fallback Playbook

Every fallback degrades toward less output, never toward unverified output.

## Model unavailable / API error

Retry twice with backoff. Then switch to `models.fallback` in core-config.
Log `agent_version` with the fallback model ID so output quality can be
attributed later.

If both unavailable: HALT. There is no local generation path. Deterministic
scripts still run — pricing and the compliance matrix can be produced
without any model, and for a T0 rate quote that is most of the deliverable.

## Deterministic script fails its self-test

Nothing ships. `run_golden_tests.py` returns 1 and the pipeline refuses to
start. This is not configurable.

If pricing is needed urgently and the engine is red, price manually from the
cost tables and mark the run `OPERATOR_ABORTED` with the manual price
recorded outside this system. Do not let the model fill in.

## Schema validation fails on model output

One retry with the schema restated. On second failure, HALT with
`SCHEMA_VIOLATION` and the offending payload attached. Do not hand-repair
the JSON — a malformed extraction usually means the source document was
misread, and repairing the shape hides the real problem.

## Evaluator cycle cap reached with CRITICAL defect open

HALT. Emit the partial document clearly marked `INCOMPLETE — CRITICAL
DEFECTS OPEN` with the defect list at the top, not buried. The operator may
finish manually; they may not receive a document that looks finished.

## KB partially unavailable

| Missing | Behavior |
|---|---|
| Cost tables | HALT at S3. Never estimate. |
| Certifications | S1 proceeds, everything resolves GAP. Output is honest but likely uncompetitive — tell the operator why. |
| Case studies | S2 halts with `NO_ELIGIBLE_CASE_STUDY`. Proposal may proceed without the section. |
| Capability records | HALT at S0 Q2. |

Only the case study path degrades gracefully, because a proposal without
case studies is weaker but still correct. A proposal without cost basis is
not.

## Run log write fails

The run has failed. Say so plainly and do not deliver the document.

This looks pedantic and is not. Unlogged output is untraceable output, and
untraceable output is exactly the artifact this system exists to prevent.
Fix the write path, rerun. The run is cheap; an unattributable proposal in
a customer's hands is not.

## Rush mode (inside 24h to submission)

Reduces evaluator scope by one tier. Does **not** reduce human review gates,
does not disable halts, does not loosen compliance. Marked `rush: true` in
the log so that if a rushed bid is later disputed, the reduced evaluation
is on record.
