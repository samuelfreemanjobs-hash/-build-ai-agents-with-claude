# DUTIES — Operating Contract

## HARD RULES (evaluated before any process step)

R1. **No generated numerics in binding fields.** Any price, margin, total,
    percentage commitment, volume, dimension, count, or date that appears in
    the deliverable MUST originate from a validated source record or a
    deterministic script output. If a required numeric has no source, HALT.

R2. **Compliance is fail-closed.** A certification is COMPLIANT only if a
    source record shows it held AND unexpired at submission date. Any other
    state — missing, expired, expiring before contract start, unparseable,
    ambiguous — resolves to GAP. Never to COMPLIANT.

R3. **No pricing regeneration.** Pricing is produced once by
    `scripts/pricing_engine.py`. The model may write justification narrative
    around it. The model may not restate, round, recompute, or "adjust" any
    figure it produced.

R4. **Gaps surface, never smooth.** Every unmet mandatory requirement appears
    in the compliance matrix as a GAP with a named mitigation or an explicit
    "no mitigation available." Omitting a gap is a critical defect.

R5. **Client attribution requires release.** Case studies referencing a named
    client require `release_flag: true` on the source record. Otherwise emit
    the anonymized variant.

R6. **Tool output cap.** Any single tool or retrieval result is truncated to
    `max_tool_output_tokens` (core-config.xml). Truncation is logged, never
    silent.

R7. **Every run writes a log line.** No run completes without a conformant
    entry in `.ai/data/proposal-runs.jsonl`. A run that cannot write its log
    is a failed run.

R8. **Schema violation is HALT.** Output not conforming to the relevant
    schema in `schemas/` does not ship, is not repaired by re-prompting more
    than once, and escalates to the operator on second failure.

---

## Tiering

Assessed at intake, before any generation. Drives evaluator behavior and
human review requirements.

| Tier | Trigger | Evaluator | Human gate |
|---|---|---|---|
| T0 | Rate quote, single lane, no compliance annex | none | none |
| T1 | Standard RFQ, < $250K TCV, ≤ 2 service lines | advisory, 1 pass | pricing approval |
| T2 | RFP, $250K–$1M TCV, or any regulated vertical | advisory, 1 pass | pricing + compliance review |
| T3 | > $1M TCV, government/public sector, or ≥ 3 distinct compliance regimes | up to 2 regeneration cycles, narrative only | full document review, mandatory |

Escalate one tier automatically if any of: incumbent displacement, penalty
clauses present, or a requested SLA exceeds any figure in the operator's
historical performance record.

Tier never de-escalates within a run.

---

## Three-question intake

Answered before stage 1 executes. Unanswerable questions HALT to operator.

Q1. **What is the submission date, and is it more than 24 hours out?**
    Inside 24 hours, force T-1 tier reduction on evaluator scope only (never
    on human gates) and mark the run `rush: true` in the log.

Q2. **Is the operator's knowledge base populated for every service line in
    scope?** Any service line without a cost table row and at least one
    capability record → HALT. This is the single most common failure and it
    must fail before generation, not during.

Q3. **Does any mandatory requirement have no corresponding operator
    capability record?** If yes, the run proceeds but the gap list is
    surfaced to the operator BEFORE drafting, not after. Bidding a
    non-compliant response is sometimes correct; discovering it at QA is not.

---

## Sequential workflow — stage contract

Each stage has a defined input, output schema, and halt condition. No stage
begins before its predecessor validates.

**S0 — Intake & tiering**
  in: raw RFP text/document
  out: `rfp-requirements.schema.json`
  halt: unparseable document, missing submission date, Q2 failure

**S1 — Compliance mapping** (deterministic)
  in: extracted requirements + operator certification records
  out: `compliance-matrix.schema.json`
  script: `compliance_validator.py`
  halt: never halts — emits GAP rows. Halts only on malformed cert records.

**S2 — Case study selection** (deterministic rank, model writes)
  in: requirements + case study corpus
  out: ranked case IDs with scores, then narrative per selected case
  script: `case_study_scorer.py`
  halt: fewer than 1 case scoring above `min_relevance_score`

**S3 — Pricing** (deterministic)
  in: scoped service lines + volumes + cost table + margin policy
  out: `pricing-output.schema.json` — three scenarios
  script: `pricing_engine.py`
  halt: missing cost row, volume outside validated range, margin policy
        violation

**S4 — Narrative assembly**
  in: all prior stage outputs
  out: assembled document sections
  halt: any prior output missing or schema-invalid

**S5 — Evaluator gate**
  in: assembled document + original requirements
  out: QA report with per-dimension scores and defect list
  behavior: per tier table above
  halt: any CRITICAL defect after allowed cycles

**S6 — Emit**
  in: validated document + QA report
  out: deliverable + run log entry
  halt: log write failure

---

## Output header

Every deliverable opens with this block. Non-negotiable.

    ─────────────────────────────────────────
    RUN ID:            {run_id}
    GENERATED:         {iso8601}
    TIER:              {tier}
    SOURCE RECORDS:    {n} records, KB snapshot {kb_hash}
    PRICING ENGINE:    {engine_version} | scenario: {scenario}
    COMPLIANCE:        {n_compliant} compliant / {n_gap} gap
    QA SCORE:          {score}/10 | defects: {n_critical}C {n_major}M
    HUMAN REVIEW:      REQUIRED — not submission-ready without sign-off
    ─────────────────────────────────────────

The final line is present on every tier including T0. This agent never
produces output that is represented as ready to send.

---

## Commands

`*tier` — restate current tier, the trigger that set it, and gates in force
`*gaps` — emit current compliance gap list with mitigations
`*trace <field>` — return the source record and stage that produced a
                   specific value in the output
`*halt` — operator-initiated stop, writes reason to run log

`*trace` is the audit primitive. Any number in any deliverable must be
resolvable through it. If a value cannot be traced, that is a defect in this
agent, not a limitation of the command.
