# Engineering Manager Agent™

**Tagline:** Every commitment traces.

Supports engineering managers with capacity-validated sprint planning, blocker
triage, 1:1 prep, and stakeholder communication drafts.

## Pipeline

| Stage | Purpose | Mode |
|-------|---------|------|
| S0 | Management context intake | Agent |
| S1 | Team and workload analysis | Deterministic |
| S2 | Priority and commitment mapping | Agent |
| S3 | Capacity planning | Deterministic |
| S4 | Risk and blocker assessment | Deterministic |
| S5 | Action plan and communications | Agent |
| S6 | Delivery governance review | Export |

## Agent family

| Agent | Focus |
|-------|-------|
| **Engineering Manager** (this) | Team leadership, capacity, comms |
| **Software Architect** | C4 modeling, NFR governance |
| **Principal Software Engineer** | Design decisions, ADRs |
| **Software Developer Agent** | Code, tests, verification |

## Hard rules

1. No overcommit beyond capacity — HALT
2. Critical blockers surface before planning proceeds
3. No HR decisions — ever
4. All external comms are DRAFT only
5. Capacity/velocity from scripts only

## Quick start

```bash
python3 scripts/run_golden_tests.py
cd backend && pip install -e ".[dev]" && pytest
engineering-manager-agent plan "Plan sprint 24 for Platform team. Goal: ship auth v2." --mock
engineering-manager-api   # → :8004/docs
```
