# Setup Guide

```bash
python3 scripts/run_golden_tests.py
cd backend && pip install -e ".[dev]" && pytest
principal-software-engineer design "Reduce API latency" --mock
principal-software-engineer-api   # → :8002/docs
```

Agent behavior is defined in `agent/SOUL.md`, `agent/DUTIES.md`, `agent/system-prompt.md`.
