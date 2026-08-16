# Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+ (optional, for frontend)
- Git

## Quick start

```bash
# 1. Verify deterministic modules
python3 scripts/run_golden_tests.py

# 2. Install backend
cd backend && pip install -e ".[dev]"

# 3. Run tests
pytest

# 4. CLI — execute a task (mock LLM)
software-developer-agent run "Add email validation to login form" --mock

# 5. API server
software-developer-api
# → http://localhost:8001/docs
```

## With real LLM

```bash
export ANTHROPIC_API_KEY=your-key-here
software-developer-agent run "Implement user registration with email validation"
```

## API usage

```bash
# Async
curl -X POST http://localhost:8001/api/v1/dev/execute \
  -H "Content-Type: application/json" \
  -d '{"task_description": "Add rate limiting to API endpoints", "repo_path": "."}'

# Sync (for testing)
curl -X POST http://localhost:8001/api/v1/dev/execute-sync \
  -H "Content-Type: application/json" \
  -d '{"task_description": "Fix null pointer in UserService.create()", "mock_llm": true}'
```

## Agent files

The agent's behavior is defined in:

| File | Purpose |
|------|---------|
| `agent/SOUL.md` | Identity, tone, constraints |
| `agent/DUTIES.md` | Operating contract, tiering, pipeline |
| `agent/system-prompt.md` | Orchestration source of truth |
| `agent/core-config.xml` | Environmental gates only |
| `skills/*/SKILL.md` | Reactive skills per stage |

## Cursor integration

To use as a Cursor agent, point to `agent/system-prompt.md` as the system prompt and load skills reactively per stage as defined in DUTIES.md.
