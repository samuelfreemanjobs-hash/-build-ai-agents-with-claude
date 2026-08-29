# Autonomous HUNTER OS

Production-ready revenue intelligence system with AI auto-scoring, email outreach, lead discovery, multi-user sync via Supabase, and Slack notifications.

## Architecture

```
Lead Discovery → AI Scoring & Enrich → Outreach Engine
                        ↓
              Supabase (PostgreSQL)
                        ↓
         HUNTER Frontend / Analytics / Slack Bot
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migration.sql` via the SQL Editor
3. Copy your project URL and anon key to `.env`

### 4. Start the backend

```bash
npm start
# or for development:
npm run dev
```

API runs at `http://localhost:3001/api`

### 5. Open the frontend

Open `frontend/hunter_crm.html` in your browser, or visit `http://localhost:3001/hunter_crm.html` when the server is running.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + service status |
| GET | `/api/config` | Scoring dimensions, services, strategies |
| POST | `/api/score` | Auto-score a company via Gemini |
| POST | `/api/leads` | Create lead (auto-scores if no breakdown provided) |
| GET | `/api/leads` | List all leads |
| GET | `/api/leads/:id` | Get single lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/outreach/send` | Send outreach email via Resend |
| GET | `/api/outreach/logs` | Outreach history |
| GET | `/api/analytics` | Pipeline analytics |

## Features

- **Auto-Scoring** — Paste a URL, Gemini reads the website, returns 7-dimension scores + diagnostic
- **Lead Pipeline** — Kanban-style pipeline with tier badges (HOT/HIGH/MEDIUM/WATCH)
- **Outreach Engine** — One-click email sending via Resend with strategy templates
- **Follow-Up Automation** — Daily cron checks leads stuck in "Outreach Sent" >7 days
- **Slack Notifications** — HOT leads and weekly reports sent automatically
- **Analytics** — Pipeline value, win rate, strategy performance by industry
- **Multi-User Sync** — Supabase replaces localStorage for team-wide data

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `GEMINI_API_KEY` | For scoring | Google Gemini API key |
| `RESEND_API_KEY` | For email | Resend API key |
| `SLACK_WEBHOOK` | Optional | Slack incoming webhook URL |
| `PORT` | Optional | Server port (default: 3001) |

## Deployment

### Backend (Railway / Render)

1. Push to GitHub
2. Connect repo to Railway or Render
3. Set environment variables
4. Deploy — `npm start` runs automatically

### Frontend (Vercel / static)

The frontend is a single HTML file. Deploy `frontend/` as a static site, or serve it from the Express backend (already configured).

## File Structure

```
hunter-autonomous-os/
├── server.js                  # Backend API
├── package.json
├── .env.example
├── supabase/
│   └── migration.sql          # Database schema
└── frontend/
    └── hunter_crm.html        # HUNTER CRM frontend
```
