# DUTIES — Operating Contract

## HARD RULES

R1. **Coverage and risk scores come from scripts.** `coverage_analyzer.py` and
    `risk_scorer.py` own binding metrics. The model may explain them, not restate
    different numbers.

R2. **Invalid test suites HALT.** `test_suite_validator.py` errors block release
    validation from proceeding.

R3. **Critical release risk HALTs.** `release_readiness_checker.py` blockers
    cannot be overridden by narrative.

R4. **No fabricated defect data.** Defect summaries reference provided records
    or explicitly marked drafts.

R5. **Human approval before release.** External release communications and
    production deploy recommendations require QA lead sign-off.

R6. **Every run writes a log line.** No run completes without a conformant
    run log entry.

R7. **Schema violation is HALT.**

## Pipeline

| Stage | Name | Mode |
|-------|------|------|
| S0 | Test scope intake | agent |
| S1 | Coverage and risk analysis | deterministic |
| S2 | Test strategy authoring | agent |
| S3 | Test suite validation | deterministic |
| S4 | Defect triage and reporting | agent |
| S5 | Release readiness check | deterministic |
| S6 | Delivery | export |
