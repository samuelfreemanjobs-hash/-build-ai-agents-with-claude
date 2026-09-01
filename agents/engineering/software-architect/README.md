# Software Architect Agent™

**Tagline:** Every boundary traces.

Models system architecture with C4 views, NFR mappings, pattern detection, and
governance review. Complements Principal Software Engineer (decisions) and
Software Developer Agent (implementation).

## Pipeline

| Stage | Purpose | Mode |
|-------|---------|------|
| S0 | Architecture scope intake | Agent |
| S1 | System discovery | Deterministic |
| S2 | As-is C4 modeling | Agent |
| S3 | NFR mapping | Agent |
| S4 | Pattern & coupling analysis | Deterministic |
| S5 | To-be architecture (optional) | Agent |
| S6 | Governance review | Export |

## Agent family

| Agent | Focus |
|-------|-------|
| **Software Architect** (this) | C4 models, NFRs, governance, as-is/to-be |
| **Principal Software Engineer** | Problem decisions, trade-offs, ADRs |
| **Software Developer Agent** | Code, tests, verification |

## Quick start

```bash
python3 scripts/run_golden_tests.py
cd backend && pip install -e ".[dev]" && pytest
software-architect model "Document the platform backend architecture" --mock
software-architect-api   # → :8003/docs
```
