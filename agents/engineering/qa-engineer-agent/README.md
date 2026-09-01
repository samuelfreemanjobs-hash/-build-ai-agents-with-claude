# QA Engineer Agent™

**Tagline:** Every defect traces.

Validates releases with deterministic coverage analysis, risk scoring, regression
detection, and release readiness gates. Complements the Software Developer Agent
(implementation) and Engineering Manager Agent (delivery planning).

## Pipeline

| Stage | Purpose | Mode |
|-------|---------|------|
| S0 | Test scope intake | Agent |
| S1 | Coverage and risk analysis | Deterministic |
| S2 | Test strategy authoring | Agent |
| S3 | Test suite validation | Deterministic |
| S4 | Defect triage and reporting | Agent |
| S5 | Release readiness check | Deterministic |
| S6 | Delivery | Export |

## Agent family

| Agent | Focus |
|-------|-------|
| **QA Engineer** (this) | Coverage, risk, regression, release readiness |
| **Software Developer Agent** | Code, tests, verification |
| **Engineering Manager Agent** | Sprint planning, capacity, comms |

## Quick start

```bash
python3 scripts/run_golden_tests.py
cd backend && pip install -e ".[dev]" && pytest
qa-engineer-agent validate "Validate Auth v2 release with login and session requirements." --mock
qa-engineer-api   # → :8005/docs
```

## Hard rules

1. Coverage and risk scores from scripts only
2. Test validation errors HALT the run
3. Critical release blockers HALT
4. No autonomous production release approval
5. Every run traces to script output or source record
