# System Design

**Version:** 0.1
**Domain:** Architecture decisions, design reviews, technical leadership

## Architecture

Single agent, seven-stage pipeline (S0–S6), reactive skills, deterministic
evaluation gate. Complements the Software Developer Agent (implementation).

## Deterministic modules

| Module | Purpose |
|--------|---------|
| `system_analyzer.py` | Service detection, infra signals, data stores |
| `dependency_mapper.py` | Inter-service and package dependencies |
| `architecture_scorer.py` | Weighted scoring across 7 criteria |
| `risk_assessor.py` | Pattern-based risk identification |
| `standards_checker.py` | Engineering standards compliance |

## Skills

| Skill | Stage |
|-------|-------|
| `problem-framing` | S0 |
| `system-context` | S1 |
| `constraints-extraction` | S2 |
| `architecture-design` | S3 |
| `trade-off-analysis` | S3/S4 |
| `adr-authoring` | S5 |
| `design-review-evaluator` | S6 |
