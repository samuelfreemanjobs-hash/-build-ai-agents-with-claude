# AI Proposals Agent™ — Complete Deployment Guide

**Version:** 2.2  
**Repo:** `ai-proposals-agent/` monorepo  
**Tagline:** Every number traces.

This guide maps to **what is actually in the repo** — not generic `proposals_agent_api.py` filenames.

---

## Full stack architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                            │
│  React dashboard (frontend/)                         │
│  - Proposal generation · status · download JSON      │
│  Operator console (ui/operator-console/)             │
│  - Trace drawer · compliance gaps · halt tab         │
└─────────────────────────┬───────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────▼───────────────────────────┐
│  API LAYER                                           │
│  FastAPI — backend/ai_proposals_agent/api/main.py   │
│  POST /api/v1/proposals/generate                     │
│  POST /api/v1/proposals/generate-sync                │
│  GET  /api/v1/proposals/status/{id}                  │
│  GET  /api/v1/proposals/download/{id}                │
│  POST /api/v1/pricing/scenarios (engine only)        │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│  CORE ENGINE — backend/ai_proposals_agent/           │
│  ProposalAgent · PricingEngine · ComplianceChecker   │
│  RunLogBuilder · halts.NON_OVERRIDABLE (G07)         │
└─────────────────────────┬───────────────────────────┘
                          │ Claude (narrative only — NOT pricing)
┌─────────────────────────▼───────────────────────────┐
│  Anthropic Claude (claude-sonnet-4-5-20250929)       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  KNOWLEDGE BASE                                      │
│  Dev: in-memory KnowledgeBase                        │
│  Prod schema: deploy/sql/init.sql (wire phase 2)     │
└──────────────────────────────────────────────────────┘
```

**v2.1 guarantee:** Pricing is computed in `PricingEngine` (`Decimal` → string JSON). Claude narrates; it does not arithmetic.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 15+ (prod KB — optional locally) |
| Docker | 24+ (optional) |
| Git | any recent |

---

## Quick start (local development)

### 1. Clone & backend setup

```bash
cd ai-proposals-agent/backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

cp ../deploy/.env.example ../deploy/.env
# Set ANTHROPIC_API_KEY or leave empty for mock LLM

export $(grep -v '^#' ../deploy/.env | xargs) 2>/dev/null || true
python3 -m ai_proposals_agent.api.main
```

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/

Equivalent to `uvicorn ai_proposals_agent.api.main:app --host 0.0.0.0 --port 8000`

### 2. Frontend (React dashboard)

Already in repo — no `npm create vite`:

```bash
cd ai-proposals-agent/frontend
npm install
npm run dev
```

- Dashboard: http://localhost:5173  
- Dev proxy: `/api` → `:8000`

### 3. Operator console (trace UI)

```bash
cd ai-proposals-agent/ui/operator-console
python3 -m http.server 8080
```

### 4. Tests

```bash
cd backend && python3 -m pytest tests/ -v   # 21 tests
```

---

## Environment configuration

Copy `deploy/.env.example` → `deploy/.env`:

```bash
# Anthropic
ANTHROPIC_API_KEY=your-api-key-here

# API
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost

# Storage
PROPOSALS_OUTPUT_DIR=./generated_proposals

# Database (docker compose)
DB_PASSWORD=change-me-in-production
DATABASE_URL=postgresql://proposals_user:change-me-in-production@postgres:5432/proposals_db

# Redis (schema ready — queue not wired)
REDIS_URL=redis://redis:6379/0

# Production (add when implementing auth)
# SECRET_KEY=your-secret-key-here
```

| Variable | Required | Notes |
|----------|----------|-------|
| `ANTHROPIC_API_KEY` | Production | Unset → mock LLM in dev |
| `CORS_ORIGINS` | Production | Restrict to your domain |
| `DATABASE_URL` | Phase 2 | Schema in `deploy/sql/init.sql` |
| `REDIS_URL` | Phase 2 | Replace in-memory `jobs_store` |

---

## Database setup

Full schema: [`deploy/sql/init.sql`](../deploy/sql/init.sql)

Includes: `companies`, `past_proposals`, `case_studies`, `certifications`, `pricing_models`, `proposal_jobs`, indexes, and DET-WARREN seed rows.

**Docker:** auto-runs on first postgres boot.

**Manual:**

```bash
createdb proposals_db
psql -U proposals_user -d proposals_db -f deploy/sql/init.sql
```

**Current state:** API reads/writes KB in memory. `DATABASE_URL` is passed in Docker but **not yet consumed by application code** — see [Known gaps](#known-gaps-in-this-build).

---

## API smoke test

```bash
# Sync proposal (mock LLM)
curl -s -X POST http://localhost:8000/api/v1/proposals/generate-sync \
  -H "Content-Type: application/json" \
  -d '{
    "rfp_text": "Company: GM Warren\nIndustry: Automotive\nServices: Dedicated inbound shuttle, Yard management, ASN compliance desk\nVolume: 1200",
    "corridor": "DET-WARREN",
    "mock_llm": true
  }' | jq .

# Engine-only pricing (no LLM)
curl -s -X POST http://localhost:8000/api/v1/pricing/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["dedicated_shuttle","yard_management","asn_compliance_desk"],
    "volume_estimates": {"annual_moves": "1200"},
    "corridor": "DET-WARREN"
  }' | jq .scenarios.balanced.total
# "396000.00"
```

---

## Docker deployment

Files: [`deploy/Dockerfile`](../deploy/Dockerfile), [`deploy/docker-compose.yml`](../deploy/docker-compose.yml)

```bash
cd ai-proposals-agent/deploy
cp .env.example .env
docker compose up -d --build
docker compose logs -f api
docker compose down
docker compose up -d --build    # after code changes
```

| Service | URL |
|---------|-----|
| Frontend (nginx) | http://localhost |
| API | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## Production deployment (AWS)

```
CloudFront (CDN + SSL)
        │
        ▼
Application Load Balancer
    ┌───┴───┐
    ▼       ▼
 ECS Task  ECS Task  (api container — deploy/Dockerfile)
    └───┬───┘
        ▼
 RDS PostgreSQL (Multi-AZ)
 ElastiCache Redis (job queue — phase 2)
 S3 (proposal artifacts + frontend static)
 Secrets Manager (ANTHROPIC_API_KEY)
 CloudWatch (logs + alarms)
```

### AWS services

| Service | Purpose | ~Cost/mo |
|---------|---------|----------|
| ECS Fargate | API containers | $60–90 |
| RDS PostgreSQL | db.t3.medium Multi-AZ | $120–180 |
| ElastiCache Redis | cache.t3.micro | $15–25 |
| ALB | Load balancing | $20–25 |
| S3 + CloudFront | Artifacts + frontend | $10–30 |
| **Total** | | **$300–500** |

Terraform outline: [`deploy/terraform/README.md`](../deploy/terraform/README.md)

### Deployment commands

```bash
# 1. Build & push API image
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker build -f deploy/Dockerfile -t ai-proposals-api ..
docker tag ai-proposals-api:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ai-proposals-api:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ai-proposals-api:latest

# 2. Terraform
cd deploy/terraform && terraform init && terraform plan && terraform apply

# 3. DB init (if not in task)
psql $DATABASE_URL -f deploy/sql/init.sql

# 4. Frontend to S3 + CloudFront
cd frontend && npm run build
aws s3 sync dist/ s3://your-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

---

## Security checklist

Before going live:

- [ ] API keys in Secrets Manager — never in code or images
- [ ] CORS restricted to your domains (`CORS_ORIGINS`)
- [ ] Rate limiting on `/api/v1/proposals/generate` (~100 req/hr/user)
- [ ] Authentication (JWT or API keys) — **not implemented yet**
- [ ] Row-level security on multi-tenant tables (`company_id`)
- [ ] RFP uploads scanned for malware
- [ ] Uploads stored outside webroot
- [ ] Database backups automated (7-day retention minimum)
- [ ] SSL/TLS on all endpoints
- [ ] Audit logging on every proposal run (run_log retention)
- [ ] Client data isolation verified per `company_id`
- [ ] NDA-covered RFP content encrypted at rest

**Critical:** RFP documents are often NDA-covered. Your Terms of Service and DPA must address retention, training use, and deletion before accepting customer documents.

---

## Unit economics

### Cost per proposal (Claude API — narrative phases only)

| Phase | Tokens (approx) |
|-------|-----------------|
| RFP analysis | 15K in, 2K out |
| Case study selection | 8K in, 1K out |
| Executive summary | 2K in, 1.5K out |
| Case studies (3×) | 3K in, 2.4K out |
| Pricing **narrative** | 2K in, 1K out |
| Compliance prose | 3K in, 2K out |
| QA check | 10K in, 2K out |
| **Total** | **~43K in, ~12K out** |

**Estimated API cost:** $0.30–$0.60 per proposal (pricing math is free — runs in Python).

### Margin math

| Tier | Revenue | Est. COGS | Notes |
|------|---------|-----------|-------|
| Starter $497/mo (5 props) | $497 | ~$3 API | ~99% gross on API |
| Pro $997/mo (15 props) | $997 | ~$9 API | Support/onboarding is real cost |
| DFY $2,000/proposal | $2,000 | ~$0.50 API + 3–4 hr human | Human review is the cost |

COGS is negligible. **DFY margin = human time.** SaaS margin = support + onboarding.

---

## Known gaps in this build

Be honest about what is **not** done:

| # | Gap | Status in repo |
|---|-----|----------------|
| 1 | **Document parsing** — real RFPs are PDF/scanned | ❌ UTF-8 `.txt` only; PDF/DOCX → 501. Need Textract or unstructured.io (**G1**). ~80% of real intake. |
| 2 | **DOCX/PDF export** | ❌ JSON only; download returns 501 for docx/pdf (**G2**). Hard requirement for customers. |
| 3 | **Authentication** | ❌ No login, API keys, or tenant isolation. `company_id` is trust-based. |
| 4 | **Job queue** | ❌ In-memory `jobs_store` — restarts lose jobs. Need Redis + worker (**phase 2**). |
| 5 | **Knowledge base** | ⚠️ In-memory sample data + Postgres schema ready. Need customer proposal ingest. |
| 6 | **Prompt JSON reliability** | ⚠️ Strips markdown fences; should migrate to tool-use / structured output. |
| 7 | **LLM pricing arithmetic** | ✅ **Fixed in v2.1** — `PricingEngine` + decimal strings; LLM narrates only. |
| 8 | **Compliance** | ⚠️ Validator exists; not all cert types mapped. Gaps surface correctly. |
| 9 | **Analytics dashboard** | ⚠️ Stub endpoint; frontend has generate only, no analytics tab yet. |

Item 7 was the most dangerous gap in early designs. **Do not regress** — never ask Claude to compute totals.

---

## Recommended build order

Validate before over-building infrastructure:

### Week 1 — Sell manually, zero code

- Land **1 paying DFY customer** ($2K/RFP)
- Run workflow in Claude + Word manually
- Learn what matters from **one real RFP**

### Weeks 2–3 — Automate the real bottleneck

Whatever slowed Week 1 most — usually:

1. **PDF parsing (G1)**
2. **Branded DOCX export (G2)**

Not more prompt tuning.

### Weeks 4–8 — Productize what repeats

- KB ingestion from past proposals
- Deterministic pricing engine ✅ (already built)
- Branded DOCX template
- Operator console for review ✅ (built)

### Month 3+ — SaaS infrastructure

Only after ~10 DFY customers:

- Auth + multi-tenancy
- Redis job queue + Postgres persistence
- Full analytics dashboard
- Rate limits + audit logs

**DFY requires:** Claude subscription, Word template, one customer — **none** of the Docker/AWS stack.

---

## Deployment roadmap (engineering)

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | FastAPI + engine + mock LLM | ✅ |
| 2 | Docker + React dashboard + operator console | ✅ |
| 3 | G1 PDF ingest + G2 DOCX export | ❌ Blocker |
| 4 | Postgres KB + job persistence | Schema ✅, wire ❌ |
| 5 | Redis queue + auth + analytics | Planned |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `HALTED` / `MISSING_COST_ROW` | Add row to KB or `pricing_models`; test via `/pricing/scenarios` |
| `VOLUME_OUT_OF_BAND` | Volume outside 1–100,000 or clarify intake |
| QA low, prose fine | `compliance_gaps` — KB issue, not writing quality |
| CORS error | Set `CORS_ORIGINS=http://localhost:5173` |
| Mock responses in prod | Set `ANTHROPIC_API_KEY`; don't pass `mock_llm: true` |

---

## File map (old names → this repo)

| Generic guide name | This repo |
|--------------------|-----------|
| `proposals_agent_api.py` | `backend/ai_proposals_agent/api/main.py` |
| `proposals_agent_backend.py` | `backend/ai_proposals_agent/agent.py` + modules |
| `proposals_agent_ui` | `frontend/` |
| `docker-compose.yml` | `deploy/docker-compose.yml` |
| `requirements.txt` | `backend/requirements.txt` + `pyproject.toml` |

---

## Related docs

- [`complete-system-design.md`](complete-system-design.md)
- [`knowledge-base.md`](knowledge-base.md)
- [`implementation-roadmap.md`](implementation-roadmap.md)
- [`../backend/README.md`](../backend/README.md)
