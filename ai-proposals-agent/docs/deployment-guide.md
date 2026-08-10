# AI Proposals Agent™ — Deployment Guide

**Version:** 2.1  
**Repo layout:** Monorepo under `ai-proposals-agent/`

---

## Full stack architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                            │
│  React dashboard (frontend/) OR operator console     │
│  (ui/operator-console/) for trace/compliance review  │
└─────────────────────────┬───────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────▼───────────────────────────┐
│  API LAYER — FastAPI (backend/ai_proposals_agent/api)│
│  POST /api/v1/proposals/generate                     │
│  GET  /api/v1/proposals/status/{id}                  │
│  POST /api/v1/pricing/scenarios (engine only)        │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│  CORE ENGINE (backend/ai_proposals_agent/)           │
│  ProposalAgent · PricingEngine · ComplianceChecker   │
│  RunLogBuilder · NON_OVERRIDABLE halts (G07)         │
└─────────────────────────┬───────────────────────────┘
                          │ Claude API (narrative only)
┌─────────────────────────▼───────────────────────────┐
│  Anthropic Claude                                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  KNOWLEDGE BASE                                      │
│  Dev: in-memory (KnowledgeBase)                       │
│  Prod: PostgreSQL (deploy/sql/init.sql) — phase 2    │
└──────────────────────────────────────────────────────┘
```

**v2.1 rule:** Pricing never goes through Claude. Engine outputs decimal strings; run-log enforces traceability.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ (frontend) |
| Docker | 24+ (optional) |
| PostgreSQL | 15+ (production KB — optional for dev) |

---

## Quick start — local development

### 1. Backend

```bash
cd ai-proposals-agent/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

cp ../deploy/.env.example ../deploy/.env
# Edit deploy/.env — set ANTHROPIC_API_KEY or leave unset for mock LLM

export $(grep -v '^#' ../deploy/.env | xargs) 2>/dev/null || true
python3 -m ai_proposals_agent.api.main
```

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/

### 2. Frontend (React dashboard)

```bash
cd ai-proposals-agent/frontend
npm install
npm run dev
```

- Dashboard: http://localhost:5173  
- Proxies `/api` → `http://localhost:8000`

### 3. Operator console (optional)

Static single-run trace UI — no build step:

```bash
cd ai-proposals-agent/ui/operator-console
python3 -m http.server 8080
```

---

## Environment variables

Copy `deploy/.env.example` → `deploy/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Prod | Claude API key; unset = mock LLM |
| `API_HOST` | No | Default `0.0.0.0` |
| `API_PORT` | No | Default `8000` |
| `API_RELOAD` | No | `true` for dev hot reload |
| `CORS_ORIGINS` | No | Comma-separated origins |
| `PROPOSALS_OUTPUT_DIR` | No | Default `generated_proposals` |
| `DATABASE_URL` | Prod phase 2 | PostgreSQL connection string |
| `REDIS_URL` | Optional | Job queue (not wired yet) |

---

## API smoke test

```bash
# Sync generate (mock LLM)
curl -s -X POST http://localhost:8000/api/v1/proposals/generate-sync \
  -H "Content-Type: application/json" \
  -d '{
    "rfp_text": "Company: GM Warren\nIndustry: Automotive\nServices: Dedicated inbound shuttle, Yard management\nVolume: 1200",
    "corridor": "DET-WARREN",
    "mock_llm": true
  }' | jq .

# Engine-only pricing
curl -s -X POST http://localhost:8000/api/v1/pricing/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["dedicated_shuttle","yard_management","asn_compliance_desk"],
    "volume_estimates": {"annual_moves": "1200"},
    "corridor": "DET-WARREN"
  }' | jq .scenarios.balanced.total
# → "396000.00"
```

---

## Docker deployment

From repo root:

```bash
cd ai-proposals-agent/deploy
cp .env.example .env
# Set ANTHROPIC_API_KEY and DB_PASSWORD

docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend (nginx) | http://localhost |
| API (direct) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

```bash
docker compose logs -f api
docker compose down
docker compose up -d --build   # after code changes
```

---

## Database setup (PostgreSQL)

Schema: `deploy/sql/init.sql`

Runs automatically when using `docker compose` postgres service.

Manual setup:

```bash
psql -U proposals_user -d proposals_db -f deploy/sql/init.sql
```

**Note:** Current API uses in-memory `KnowledgeBase`. PostgreSQL persistence is documented and schema-ready — wire `DATABASE_URL` in a future release (see roadmap below).

---

## Production checklist

### Before go-live

- [ ] Set `ANTHROPIC_API_KEY` via secrets manager (not `.env` in image)
- [ ] Restrict `CORS_ORIGINS` to your dashboard domain
- [ ] Disable `API_RELOAD`
- [ ] Persist jobs to PostgreSQL / Redis (replace in-memory `jobs_store`)
- [ ] Wire KB to PostgreSQL
- [ ] S3 or volume backup for `generated_proposals/`
- [ ] HTTPS termination (nginx / ALB / CloudFront)
- [ ] Rate limiting on `/api/v1/proposals/generate`
- [ ] G1 PDF ingest + G2 DOCX export

### Monitoring

- Health: `GET /` → `status: healthy`
- Log pipeline halts: `HALTED` + `halt_cause` in job status
- Alert on `FAILED` rate > threshold

---

## AWS production (reference)

```
CloudFront → ALB → ECS Fargate (api) × N
                      ↓
              RDS PostgreSQL (Multi-AZ)
              ElastiCache Redis (job queue)
              S3 (proposal artifacts)
              Secrets Manager (ANTHROPIC_API_KEY)
```

**Estimated cost:** $300–500/mo (small production footprint)

Terraform starter: see `deploy/terraform/README.md` (outline only — customize for your account).

---

## Deployment roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | FastAPI + in-memory jobs + mock LLM fallback | ✅ Done |
| 2 | Docker compose + React dashboard | ✅ Done |
| 3 | PostgreSQL KB + job persistence | Schema ready |
| 4 | Redis queue + horizontal API scale | Planned |
| 5 | S3 exports + DOCX (G2) | Planned |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `HALTED` / `MISSING_COST_ROW` | Add cost row in KB or use `/pricing/scenarios` to debug |
| Empty Claude responses | Check `ANTHROPIC_API_KEY`; use `mock_llm: true` for dev |
| CORS errors from frontend | Set `CORS_ORIGINS=http://localhost:5173` |
| QA score low, writing good | KB compliance gaps — expected; check `compliance_gaps` field |

---

## Related docs

- [`complete-system-design.md`](complete-system-design.md)
- [`knowledge-base.md`](knowledge-base.md)
- [`../backend/README.md`](../backend/README.md)
- [`../deploy/docker-compose.yml`](../deploy/docker-compose.yml)
