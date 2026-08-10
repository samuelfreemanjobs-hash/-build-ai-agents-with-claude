# AI Proposals Agent™

**Every number traces.**

Production-oriented AI agent system for **logistics proposal generation** — RFP analysis, compliance-first drafting, engine-bound pricing, and human-in-the-loop review gates.

Built for the same Metro Detroit logistics corridor as [Freeman Intel](../freeman-intel/) (sister product: plant inbound vs. commercial proposals).

## Principles

1. **No generative authority on money** — pricing comes from the engine; LLM assembles narrative around traced figures.
2. **Compliance gaps are loud** — missing ISO/CTPAT/OTIF evidence renders as gaps, not silent omissions.
3. **Halts are designed outputs** — named cause, fix path, never buried in a toast.
4. **Human review required** — enforced in the run-log schema, not just prompt prose.

## Repository layout

| Path | Description |
|------|-------------|
| [`docs/complete-system-design.md`](docs/complete-system-design.md) | **Full spec** — all 15 sections, v2.1 merged |
| [`docs/deployment-guide.md`](docs/deployment-guide.md) | **Complete deploy guide** — local, Docker, AWS, economics |
| [`docs/known-gaps.md`](docs/known-gaps.md) | Honest gap list + build order |
| [`docs/system-design.md`](docs/system-design.md) | v2 architecture guarantees |
| [`backend/`](backend/) | Python engine + FastAPI |
| [`frontend/`](frontend/) | React SaaS dashboard |
| [`deploy/`](deploy/) | Docker Compose, SQL init, `.env.example` |
| [`ui/operator-console/`](ui/operator-console/) | Operator trace/compliance UI |

## Quick start

### Backend + API

```bash
cd backend && pip install -e ".[dev]"
python3 -m ai_proposals_agent.api.main   # http://localhost:8000/docs
python3 -m pytest tests/ -v              # 21 tests
```

### Frontend

```bash
cd frontend && npm install && npm run dev   # http://localhost:5173
```

### Docker (full stack)

```bash
cd deploy && cp .env.example .env
docker compose up -d --build
# http://localhost · http://localhost:8000/docs
```

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for production checklist and AWS outline.

## Status

- [x] System design, schemas, prompts
- [x] Python backend + FastAPI + 21 tests
- [x] Operator console + React dashboard + Docker deploy
- [x] PostgreSQL init schema (API persistence — phase 2)
- [ ] G1: PDF/DOCX RFP ingest · G2: DOCX export
- [ ] Run-log browser · KB coverage view

## License

Proprietary — Freeman Intel / AI Proposals Agent™. All rights reserved.
