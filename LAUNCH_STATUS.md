# Launch Status — HUNTER Intelligence OS

Last updated: 2026-08-29

## Launch Checklist Progress

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Set up Supabase | ⚠️ **Your action** | Run `supabase/migration-full.sql` in Supabase SQL Editor. Add `SUPABASE_URL` + `SUPABASE_ANON_KEY` to `.env` |
| 2 | Add API keys | ⚠️ **Your action** | Gemini, Resend, Slack keys go in `.env`. System runs locally without them (fallback mode). |
| 3 | Deploy | ✅ **Ready** | `docker compose up` or push to Railway (railway.json included). Dockerfile tested. |
| 4 | Import n8n workflows | ✅ **Ready** | `n8n/hunter-lead-discovery.json` + `n8n/hunter-follow-up-sequence.json` validated. Import into n8n cloud. |
| 5 | Seed 10 leads | ✅ **Done** | Run `npm run seed` or `POST /api/seed`. 10 scored manufacturing leads in `data/seed-leads.json`. |
| 6 | Outreach ready | ✅ **Done** | 10 personalized emails in `content/outreach-batch-001.md`. HOT lead first: Great Lakes Aerospace (91). |
| 7 | LinkedIn post ready | ✅ **Done** | Copy/paste from `content/linkedin-post-001.md`. Post Tuesday 7 AM. |
| 8 | Booking link | ⚠️ **Your action** | Create Cal.com or Calendly 15-min event. Set `BOOKING_URL` in `.env`. Landing page auto-shows button. |

## What Works Right Now (No Keys Required)

- ✅ Server starts with local JSON storage (`data/`)
- ✅ 10 pre-scored leads seedable via `npm run seed`
- ✅ Landing page with lead capture form
- ✅ Operator dashboard with daily briefing
- ✅ Full CRM pipeline
- ✅ AI scoring (fallback mode without Gemini)
- ✅ Proposal + diagnostic generation (fallback templates)
- ✅ Health check: `npm run health`

## What Needs Your Keys

| Key | Enables | Get it at |
|-----|---------|-----------|
| `SUPABASE_URL` + `SUPABASE_ANON_KEY` | Production database, multi-device sync | supabase.com |
| `GEMINI_API_KEY` | Live AI scoring, proposals, diagnostics | aistudio.google.com |
| `RESEND_API_KEY` | Email outreach sending | resend.com |
| `SLACK_WEBHOOK` | HOT lead + daily alerts | api.slack.com/messaging/webhooks |
| `BOOKING_URL` | Diagnostic call booking on landing page | cal.com or calendly.com |

## Quick Commands

```bash
npm run setup    # Full setup + seed + health check
npm start        # Start server
npm run seed     # Seed 10 leads
npm run health   # Validate all endpoints
```

## Revenue Actions (Do Today)

1. **Post LinkedIn** → `content/linkedin-post-001.md`
2. **Send HOT outreach** → Great Lakes Aerospace email in `content/outreach-batch-001.md`
3. **Send 4 more HIGH outreach** → emails #1-4 in same file
4. **Set booking URL** → create Cal.com event, add to `.env`
5. **Import n8n** → activate daily discovery workflow

## System URLs (Local)

| Screen | URL |
|--------|-----|
| Landing | http://localhost:3001/ |
| Operator | http://localhost:3001/operator.html |
| CRM | http://localhost:3001/hunter_crm.html |
