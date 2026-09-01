# AI Proposals Agent™ — Backend

Python backend aligned with **v2.1** architecture:

- **Pricing Engine** — deterministic `Decimal` math; money exported as strings
- **Compliance Checker** — KB validators; GAP blocks, not silent omission
- **Run Log** — `COMPLETED` requires `untraceable_count == 0`
- **Halt handler** — `NON_OVERRIDABLE` causes (G07 enforced in code)
- **ProposalAgent** — orchestrates pipeline; LLM for narrative only

## Install

```bash
cd backend
pip install -e ".[dev]"
```

## Run demo (no API key — mock LLM)

```bash
python -m ai_proposals_agent.cli --demo
```

## Run with Anthropic API

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python -m ai_proposals_agent.cli --rfp path/to/rfp.txt
```

## REST API

```bash
python3 -m ai_proposals_agent.api.main
# Docs: http://localhost:8000/docs
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/proposals/generate` | POST | Async proposal job |
| `/api/v1/proposals/generate-sync` | POST | Sync (testing) |
| `/api/v1/proposals/status/{job_id}` | GET | Poll job |
| `/api/v1/proposals/download/{job_id}` | GET | JSON download |
| `/api/v1/pricing/scenarios` | POST | Engine-only pricing |
| `/api/v1/compliance/check` | GET | KB compliance validation |

Uses real `ProposalAgent` + `PricingEngine`. Auto-enables mock LLM when `ANTHROPIC_API_KEY` unset.

## Tests

```bash
pytest tests/ -v
```

## Layout

```
ai_proposals_agent/
  models.py           # dataclasses & enums
  halts.py            # HaltError, NON_OVERRIDABLE
  pricing_engine.py   # Decimal pricing, 3 scenarios
  compliance.py       # Validator against KB credentials
  run_log.py          # Trace bindings, outcome rules
  knowledge_base.py   # Sample KB + cost rows
  prompts.py          # Prompt templates (v2.1)
  llm.py              # Claude client + mock
  agent.py            # ProposalAgent orchestrator
  cli.py              # Entry point
tests/
  test_pricing_engine.py
  test_compliance.py
  test_run_log.py
  test_halts.py
  test_agent_demo.py
```
