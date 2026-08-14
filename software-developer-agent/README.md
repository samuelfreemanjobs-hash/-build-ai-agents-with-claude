# Software Developer Agent™

Single-agent + skills system for turning structured development tasks into
verified, reviewable code changes.

**Status:** Architecture and deterministic core complete. Not production ready.
See [Known Gaps](docs/known-gaps.md).

**Tagline:** Every change traces.

---

## Quick verify

```bash
python3 scripts/run_golden_tests.py
```

All five deterministic component suites must return PASS before any deliverable ships.

```bash
cd backend && pip install -e ".[dev]" && pytest
```

---

## Architecture in one line

Single agent, sequential seven-stage pipeline (S0–S6), reactive skills, one
code review gate on all tiers. Multi-agent was evaluated and rejected for this
domain — software development benefits from unified context, not agent
coordination overhead.

## The core safety property

The model has no generative authority over verification outcomes.

| Binding fact | Source |
|---|---|
| Test results | `scripts/test_runner.py` |
| Lint status | `scripts/lint_validator.py` |
| Security findings | `scripts/security_scanner.py` |
| Dependency vulnerabilities | `scripts/dependency_checker.py` |
| Codebase structure | `scripts/codebase_analyzer.py` |
| Code, plans, review narrative | Model (Claude) |

Every verification outcome resolves through deterministic script output.

---

## Repository layout

```
software-developer-agent/
├── agent/           # SOUL, DUTIES, system-prompt, core-config.xml
├── skills/          # Reactive skills (6 stages)
├── scripts/         # Deterministic core + golden test runner
├── schemas/         # JSON Schema contracts
├── backend/         # FastAPI + Python package
├── docs/            # System design, known gaps
└── .ai/data/        # Run log storage
```

| Path | Description |
|---|---|
| [`agent/system-prompt.md`](agent/system-prompt.md) | Orchestration source of truth |
| [`agent/DUTIES.md`](agent/DUTIES.md) | Operating contract, tiering, pipeline |
| [`agent/SOUL.md`](agent/SOUL.md) | Identity, tone, constraints |
| [`docs/system-design.md`](docs/system-design.md) | Architecture and component map |
| [`SETUP.md`](SETUP.md) | Installation and usage guide |

---

## Pipeline

| Stage | Name | Mode |
|---|---|---|
| S0 | Task intake and clarification | agent |
| S1 | Codebase analysis | deterministic |
| S2 | Implementation planning | agent |
| S3 | Code generation | agent |
| S4 | Verification | deterministic |
| S5 | Code review | agent |
| S6 | Delivery | export |

---

## Run locally

### Deterministic core

```bash
python3 scripts/codebase_analyzer.py .
python3 scripts/test_runner.py . --selftest
python3 scripts/lint_validator.py . --selftest
python3 scripts/security_scanner.py . --selftest
python3 scripts/dependency_checker.py . --selftest
python3 scripts/run_golden_tests.py
```

### CLI

```bash
cd backend && pip install -e ".[dev]"
software-developer-agent run "Add email validation to login form" --mock
```

### API

```bash
software-developer-api   # → :8001/docs
```

---

## Hard rules

1. No untested code ships — test suite must pass or HALT
2. Critical security findings HALT the run
3. Lint errors HALT; warnings surface but do not block
4. No secrets in generated code — ever
5. All file changes trace to a requirement in the task spec
6. Every run writes a conformant run log entry
7. Schema violation is HALT
8. Human approval required before merge or deploy

---

## License

Proprietary — Software Developer Agent™. All rights reserved.
