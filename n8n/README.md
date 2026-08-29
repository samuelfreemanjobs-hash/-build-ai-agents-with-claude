# HUNTER n8n Lead Discovery Workflow

Automatically discovers manufacturing companies via LinkedIn (Apify), scores them with HUNTER's Gemini engine, and creates leads in Supabase.

## Workflow Overview

```
Daily 6AM / Manual / Webhook
         ↓
    Config (API URLs, industries, locations)
         ↓
    Build Search Queries (industry × location matrix)
         ↓
    Apify LinkedIn Company Search
         ↓
    Normalize → Deduplicate against existing leads
         ↓
    HUNTER POST /api/leads (auto-scores each lead)
         ↓
    HOT leads → Slack alert + daily summary report
```

## Prerequisites

1. **HUNTER OS backend** running with Supabase configured (`npm start`)
2. **n8n** instance — [n8n.io](https://n8n.io) cloud or self-hosted
3. **Apify account** — [apify.com](https://apify.com) (free tier works for testing)
4. **Slack webhook** (optional) — for HOT lead alerts

## Import the Workflow

1. Open n8n → **Workflows** → **Import from File**
2. Select `n8n/hunter-lead-discovery.json`
3. Open the **Config** node and update:

| Field | Value |
|-------|-------|
| `hunterApiUrl` | Your HUNTER API URL (e.g. `https://your-app.railway.app/api`) |
| `apifyToken` | Apify API token from [console.apify.com/account/integrations](https://console.apify.com/account/integrations) |
| `apifyActorId` | LinkedIn scraper actor (default: `harvestapi~linkedin-company-search`) |
| `slackWebhook` | Slack incoming webhook URL |
| `industries` | Target industries array |
| `locations` | Target US states/regions |

4. **Activate** the workflow

## Triggers

### 1. Scheduled (Daily 6 AM)

Runs automatically. Searches each industry × location combination via Apify, creates new leads.

### 2. Manual Test

Click **Test workflow** in n8n to run immediately without waiting for the schedule.

### 3. Webhook Push

Push a single company directly into HUNTER:

```bash
curl -X POST https://your-n8n.app/webhook/hunter-discover \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Acme CNC Manufacturing",
    "url": "https://acmecnc.com",
    "industry": "CNC Machining",
    "location": "Detroit, MI",
    "employeeCount": 150,
    "decisionMaker": "VP Operations"
  }'
```

The webhook bypasses Apify and sends the company directly to HUNTER for auto-scoring.

## Apify Setup

### Recommended Actors

| Actor | ID | Notes |
|-------|-----|-------|
| LinkedIn Company Search | `harvestapi/linkedin-company-search` | Best for industry + location queries |
| LinkedIn Company Scraper | `bebity/linkedin-company-scraper` | Scrape by company URL list |

To change actors, update `apifyActorId` in the Config node.

### Apify Input Format

The workflow sends:

```json
{
  "search": "CNC Machining companies in Michigan",
  "maxResults": 15,
  "location": "Michigan"
}
```

Adjust `maxResultsPerQuery` in Config to control volume per search.

## Deduplication

Before creating leads, the workflow:

1. Fetches all existing leads from `GET /api/leads`
2. Compares company names (case-insensitive)
3. Skips duplicates — only new companies are scored and inserted

## Rate Limiting

A 2-second wait between lead creations prevents Gemini API rate limits during batch scoring. For large discovery runs (50+ leads), consider increasing the wait or running during off-peak hours.

## Slack Notifications

Two notification types:

- **HOT Alert** — Fires immediately when a discovered lead scores ≥90
- **Daily Report** — Summary after each run: total created, HOT/HIGH counts, company list

HUNTER's backend also sends its own HOT lead Slack notification on `POST /api/leads`, so you may get duplicate alerts for HOT leads. Disable one if preferred.

## Customizing Search Targets

Edit the **Config** node `industries` and `locations` arrays:

```javascript
industries: [
  "CNC Machining",
  "Tier II Automotive Stamping",
  "3PL Warehousing",
  "Tool & Die Validation",
  "Wire Harness Assembly"
]

locations: [
  "Michigan",
  "Ohio",
  "Indiana",
  "Tennessee",
  "South Carolina"
]
```

This creates 25 search queries (5 industries × 5 locations) per daily run.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `503 Supabase not configured` | Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in HUNTER backend `.env` |
| Apify timeout | Increase `waitForFinish` in the Apify HTTP node (default: 120s) |
| Empty results | Check Apify actor input format; try a different actor |
| All duplicates | Normal — means companies already exist in pipeline |
| Gemini scoring slow | Expected — each lead triggers a website scrape + AI call (~5-10s each) |

## Alternative: Google Sheets Source

If you don't want Apify, replace the Apify nodes with a **Google Sheets** node that reads a company list, then connect directly to **Merge All Leads**. Columns: `company`, `url`, `industry`, `location`, `employeeCount`.

## File

- `hunter-lead-discovery.json` — Import this file into n8n
