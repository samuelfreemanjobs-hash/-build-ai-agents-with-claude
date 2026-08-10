# Operator Runbook

## SLOs

| Metric | Target | Breach action |
|---|---|---|
| Wall clock, T0–T1 | p95 ≤ 6 min | Profile stage timings; check S0 document size |
| Wall clock, T2–T3 | p95 ≤ 20 min | Check evaluator cycle count |
| Halt rate | ≤ 25% of runs | Above this, KB is underpopulated — see §KB Maintenance |
| Mandatory-gap rate | tracked, not targeted | This is a business signal, not a defect rate |
| Untraceable numerics | 0, always | Any nonzero is a P0 |
| Component self-tests | 4/4 green | Nothing ships red |

Halt rate has no aggressive target on purpose. A halt is the system
refusing to guess. Driving it to zero by loosening gates is the single
worst change anyone could make to this repo.

---

## Standard run

1. `python3 scripts/run_golden_tests.py` — must be green.
2. Place the RFP source in `./in/`. Confirm text is extractable.
3. Start the run. Answer the three intake questions.
4. **Review the S0 gap preview before drafting.** This is the decision
   point. A bid with four mandatory gaps may be a no-bid, and finding that
   out now costs nothing.
5. Approve tier and pricing scenario.
6. Review the deliverable. The header tells you what to check first.
7. Record outcome via feedback when the bid resolves. Win/loss data is the
   only thing that makes case study scoring better over time.

---

## Handling a HALT

A halt names a stage, a cause, and a record. Fix the record; do not
override.

| Cause | Fix |
|---|---|
| `MISSING_COST_ROW` | Add the validated row to `kb/cost-tables/`. Requires a real cost, not an estimate. |
| `VOLUME_OUT_OF_BAND` | Add a cost row covering that volume band. Do not widen an existing band to make the error go away — the band exists because unit economics change at scale. |
| `KB_COVERAGE_GAP` | Populate capability records for the uncovered service line. |
| `MALFORMED_CERT_RECORD` | Fix `kb/certifications.json`. Check date format is `YYYY-MM-DD`. |
| `NO_ELIGIBLE_CASE_STUDY` | Either proceed without a case study section, or add a relevant case. Do not lower `min_relevance_score` for one bid. |
| `UNPARSEABLE_INPUT` | Scanned PDF with no text layer. Currently a known gap (README G1) — OCR externally and resubmit. |
| `CRITICAL_DEFECT_UNRESOLVED` | Read the defect list. Usually a page limit or an unflagged mandatory gap. |

### Override path

Overrides exist for genuine edge cases and are deliberately awkward.

```
*override <halt_cause> --justification "<min 20 chars>" --operator <name>
```

Writes to `overrides[]` in the run log with a timestamp. There is no silent
override and no config flag that disables halts globally.

Never override `MISSING_COST_ROW` or `VOLUME_OUT_OF_BAND`. Those produce a
price with no cost basis, which is the failure this system was built to
prevent.

---

## KB maintenance

| Asset | Cadence | Owner |
|---|---|---|
| Cost tables | Monthly, or on any carrier rate change | Pricing |
| Certifications | On issue/renewal + quarterly expiry sweep | Compliance |
| Case studies | Quarterly; add every closed engagement | BD |
| Capability records | On service line change | Ops |
| Win/loss outcomes | Within 5 days of bid resolution | BD |

**Quarterly expiry sweep is not optional.** A certification expiring in
90 days will start producing `EXPIRES_MID_TERM` gaps on any bid with a
contract start beyond that date. Better to see it in a sweep than in a
proposal.

---

## Monthly review

1. Halt causes ranked (query in observability-contract.md §Reading the log).
2. Token drift vs. `token_economics.py` constants. Update and re-run gate.
3. Mandatory-gap rate trend — rising means either the KB is stale or the
   firm is bidding outside its capability envelope. Both are worth knowing.
4. Check ADR-001 §5 escalation triggers. If none fire, the architecture
   decision stands and does not get revisited.
5. Re-verify `RATE_CARD` in `token_economics.py`; update `LAST_VERIFIED`.

---

## Incident: a wrong number shipped

P0. Work in this order.

1. Pull the run log entry by `run_id`.
2. `*trace` the field. Determine whether the value came from a script or
   from model narrative.
3. **Script origin** → the source record was wrong. Fix the record. Query
   the log for every run sharing that `kb_snapshot_hash` and notify on all
   affected bids.
4. **Narrative origin** → the model emitted a binding numeric outside a
   script. This is a containment failure in the hard constraints. Add a
   golden case reproducing it before fixing anything. The test comes first.
5. Log the incident. If narrative origin, treat the constraint set in
   `system-prompt.md` as compromised until the golden case passes.

Case 4 is the one that matters. It means the core safety property leaked,
and a fix without a regression test is not a fix.
