# Principal Software Engineer Agent™

Single-agent + skills system for turning engineering problems into structured
architecture designs with explicit trade-offs, risk assessment, and ADRs.

**Status:** Architecture and deterministic core complete. Not production ready.
See [Known Gaps](docs/known-gaps.md).

**Tagline:** Every decision traces.

---

## Quick verify

```bash
python3 scripts/run_golden_tests.py
cd backend && pip install -e ".[dev]" && pytest
```

---

## Core safety property

The model has **no generative authority over risk scores or standards compliance.**

| Binding fact | Source |
|---|---|
| Architecture scores | `scripts/architecture_scorer.py` |
| Risk assessment | `scripts/risk_assessor.py` |
| Standards compliance | `scripts/standards_checker.py` |
| System structure | `scripts/system_analyzer.py` |
| Dependencies | `scripts/dependency_mapper.py` |
| Design narrative, ADRs | Model (Claude) |

---

## Pipeline

| Stage | Name | Mode |
|---|---|---|
| S0 | Problem framing and intake | agent |
| S1 | System analysis | deterministic |
| S2 | Constraints extraction | agent |
| S3 | Architecture design | agent |
| S4 | Trade-off and risk evaluation | deterministic |
| S5 | Design document and ADR authoring | agent |
| S6 | Design review and delivery | export |

---

## Relationship to Software Developer Agent

| Agent | Scope |
|---|---|
| **Principal Software Engineer** (this) | Architecture, trade-offs, ADRs, design review |
| **Software Developer Agent** | Implementation, tests, code review, verification |

The Principal agent produces designs; the Developer agent implements them.

---

## Run locally

```bash
# CLI
principal-software-engineer design "Our API p99 exceeds 500ms — how do we fix it?" --mock

# API
principal-software-engineer-api   # → :8002/docs
```

---

## Hard rules

1. No recommendation without at least 2 evaluated alternatives
2. Critical unacknowledged risks HALT the run
3. Standards violations at error severity HALT
4. No unvalidated performance/scale/cost claims
5. Every decision traces to a requirement or constraint
6. Human sign-off required before implementation
