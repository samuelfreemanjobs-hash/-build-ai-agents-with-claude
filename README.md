# Autonomous HUNTER OS — Complete Business Operating System

**One person. Full autonomous revenue machine. Launch-ready.**

HUNTER Intelligence is a complete business-in-a-box for solo operators selling operational intelligence to mid-market manufacturers. Every system — sales, delivery, finance, marketing, operations — is built, automated, and ready to profit.

## What You Get

| Layer | Components |
|-------|-----------|
| **Revenue Engine** | AI lead scoring, outreach, proposals, diagnostics, pipeline CRM |
| **Discovery** | n8n LinkedIn auto-discovery + follow-up email sequences |
| **Delivery** | Service catalog, SOW/MSA templates, delivery prompts |
| **Finance** | Invoice generation, AR tracking, revenue metrics, MRR |
| **Operations** | Operator dashboard, daily briefing, task management |
| **Go-To-Market** | Landing page, lead capture, email sequences, LinkedIn content system |
| **Business Intel** | Business model, pricing, financial targets, 30-day launch plan |

## Architecture

```
                    ┌─────────────────────────────────┐
                    │     SOLO OPERATOR (You)         │
                    │  Decide · Sell · Deliver · Collect │
                    └──────────────┬──────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │  DISCOVER   │         │   SELL      │         │  DELIVER    │
   │  n8n+Apify  │────────▶│  HUNTER CRM │────────▶│  Projects   │
   │  LinkedIn   │         │  Proposals  │         │  Invoices   │
   └─────────────┘         │  Diagnostics│         └─────────────┘
                           └──────┬──────┘
                                  ▼
                    ┌─────────────────────────┐
                    │  Supabase (PostgreSQL)   │
                    │  Leads · Clients · Projects │
                    │  Invoices · Tasks · Proposals │
                    └─────────────────────────┘
```

## Quick Start (Launch Today)

```bash
# 1. Install & configure
npm install
cp .env.example .env   # Fill in all keys

# 2. Database
# Run supabase/migration.sql then migration-v2-business.sql in Supabase SQL Editor

# 3. Start
npm start

# 4. Open
# Landing page:    http://localhost:3001/
# Operator Center: http://localhost:3001/operator.html
# CRM:             http://localhost:3001/hunter_crm.html

# 5. Automate
# Import n8n/*.json workflows — see n8n/README.md

# 6. Launch
# Follow business/LAUNCH_CHECKLIST.md
```

## Docker Deploy

```bash
docker compose up -d
# or deploy Dockerfile to Railway/Render/Fly.io
```

## API Endpoints

### Core
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health |
| GET | `/api/config` | Scoring config + service catalog |
| POST | `/api/score` | AI-score a company |
| POST | `/api/capture` | Landing page lead capture |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/leads` | Lead pipeline |
| POST | `/api/leads/:id/convert` | Close deal → client + project + invoice |
| POST | `/api/proposals/generate` | AI proposal generation |
| POST | `/api/diagnostics/generate` | AI diagnostic report |
| POST | `/api/outreach/send` | Send outreach email |
| GET | `/api/outreach/batch/preview` | Preview batch recipients (`?tiers=HOT,HIGH`) |
| POST | `/api/outreach/batch` | Batch send to tier(s), supports `dryRun` |
| POST | `/api/webhooks/resend` | Resend webhooks — auto stage updates on open/click |

### Business
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Full service catalog with pricing |
| GET | `/api/business/metrics` | Revenue, pipeline, MRR, health score |
| GET | `/api/operator/daily` | Daily operator briefing |
| CRUD | `/api/clients` | Client management |
| CRUD | `/api/projects` | Project delivery tracking |
| CRUD | `/api/invoices` | Invoice & AR management |
| CRUD | `/api/tasks` | Operator task list |

## Revenue Targets

| Month | Target | How |
|-------|--------|-----|
| 1-2 | $25K/mo | 1 project closing |
| 3-4 | $50K/mo | 2 projects |
| 5-6 | $75K/mo | 2 projects + 1 retainer |
| 7-12 | $100K+/mo | 2 projects + 3 retainers |

See `business/BUSINESS_MODEL.md` and `business/PRICING.md` for full details.

## File Structure

```
hunter-autonomous-os/
├── server.js                     # API server
├── lib/
│   ├── services-catalog.js       # 7 services + pricing + retainer
│   ├── proposal-engine.js        # AI proposal/diagnostic generation
│   ├── business-metrics.js       # Revenue, pipeline, health scoring
│   └── routes-business.js        # Business API routes
├── frontend/
│   ├── index.html                # Landing page (lead capture)
│   ├── operator.html             # Solo operator command center
│   └── hunter_crm.html           # Full CRM
├── business/
│   ├── BUSINESS_MODEL.md         # ICP, unit economics, GTM
│   ├── PRICING.md                # Service catalog pricing
│   ├── OPERATOR_PLAYBOOK.md      # Daily routine for solo operator
│   └── LAUNCH_CHECKLIST.md       # 30-day launch plan
├── prompts/                      # AI prompts for every business function
├── templates/                    # MSA, SOW, email sequences
├── supabase/
│   ├── migration.sql             # Core tables
│   └── migration-v2-business.sql # Clients, projects, invoices, tasks
├── n8n/                          # Automation workflows
├── Dockerfile + docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Database |
| `SUPABASE_ANON_KEY` | Yes | Database auth |
| `GEMINI_API_KEY` | Yes | AI scoring, proposals, diagnostics |
| `RESEND_API_KEY` | For email | Outreach + follow-ups |
| `RESEND_FROM` | For email | Verified sender address |
| `SLACK_WEBHOOK` | Recommended | HOT lead + daily alerts |
| `REVENUE_TARGET_MONTHLY` | Optional | Default: 50000 |

## Your Daily Workflow (90 min)

1. Open **Operator Dashboard** → act on priorities
2. Send outreach to HOT leads (CRM)
3. Follow up proposals
4. Check delivery on active projects
5. Collect overdue invoices

Everything else runs autonomously. See `business/OPERATOR_PLAYBOOK.md`.
