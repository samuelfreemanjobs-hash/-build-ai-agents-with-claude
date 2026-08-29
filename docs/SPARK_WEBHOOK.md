# Gemini Spark → HUNTER Webhook

Auto-import Gemini Spark opportunity cards into HUNTER after each daily run.

## Endpoint

```
POST https://your-domain.com/api/webhooks/spark
```

## Authentication

Set `SPARK_WEBHOOK_SECRET` in `.env`. Send it on every request:

```
Authorization: Bearer YOUR_SECRET
```

Or:

```
X-Spark-Secret: YOUR_SECRET
```

If `SPARK_WEBHOOK_SECRET` is unset, the endpoint accepts unauthenticated requests (dev only).

## Payload formats

The importer accepts any of these shapes:

**Single card**
```json
{
  "company": "Riviera Industries",
  "location": "Warren, MI",
  "industry": "CNC Machining",
  "score": 92,
  "scoreBreakdown": { "problemSeverity": 23, "buyingSignal": 18, ... },
  "detectedProblems": ["CMM queue in spreadsheet", "..."],
  "matchedService": "CNC Spindle Telemetry & CMM Queue Bridge",
  "outreachStrategy": "A",
  "outreachSubject": "I noticed something at Riviera Industries",
  "outreachBody": "..."
}
```

**Array of cards**
```json
[
  { "company": "Riviera Industries", ... },
  { "company": "Logos Logistics", ... }
]
```

**Wrapped (recommended for Spark)**
```json
{
  "runDate": "2026-08-29",
  "region": "Metro Detroit",
  "outreachQueue": [ ... ]
}
```

Also supported: `opportunities`, `leads`, `cards`, `outreach_queue`.

## What HUNTER does on import

1. Maps Spark fields → HUNTER lead schema
2. **Deduplicates** by company name (skips existing leads)
3. Uses **HUNTER catalog pricing** (not Spark's low estimates)
4. Preserves Spark outreach subject/body when provided
5. Slack alert for **HOT** leads (score ≥ 90)
6. Sets `source: gemini-spark` on imported leads

## Configure Gemini Spark (7 AM daily)

In your Spark automation / n8n / Make workflow, add an HTTP Request step after the run completes:

| Setting | Value |
|---------|-------|
| Method | `POST` |
| URL | `https://your-app.railway.app/api/webhooks/spark` |
| Header | `Authorization: Bearer YOUR_SPARK_WEBHOOK_SECRET` |
| Header | `Content-Type: application/json` |
| Body | Full Spark JSON output (or just `outreachQueue` array) |

### n8n example

1. **Schedule Trigger** — `0 7 * * *` (7 AM EDT = `0 11 * * *` UTC in summer)
2. **Gemini / HTTP** — run your Spark prompt, get JSON
3. **HTTP Request** — POST to `/api/webhooks/spark` with Bearer token

## Manual test

```bash
# Import sample Spark file
curl -X POST http://localhost:3001/api/webhooks/spark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SPARK_WEBHOOK_SECRET" \
  -d @data/gemini-spark-import.json
```

Expected response:
```json
{
  "received": true,
  "imported": 4,
  "skipped": 0,
  "skippedCompanies": [],
  "errors": [],
  "leads": [ ... ]
}
```

Re-running the same payload skips duplicates:
```json
{ "imported": 0, "skipped": 4, "skippedCompanies": ["Riviera Industries", ...] }
```

## Field mapping reference

| Spark field | HUNTER field |
|-------------|--------------|
| `company` / `Company` | `company` |
| `location` | `location` |
| `industry` | `industry` |
| `decisionMaker` | `decision_maker` |
| `employeeCount` | `size` |
| `score` / `opportunityScore` | `score` |
| `scoreBreakdown` | `score_breakdown` |
| `detectedProblems` / `buyingSignals` | `detected_problems` |
| `matchedService` | `matched_service` (+ catalog price) |
| `giveBeforeAsk` | `give_before_ask` |
| `diagnostic` | `diagnostic` |
| `outreachStrategy` (A–F) | `outreach_strategy` |
| `outreachSubject` / `subject` | `outreach_subject` |
| `outreachBody` / `messageDraft` | `outreach_body` |

## Pricing note

Spark often estimates $3.5K–$9K. HUNTER maps to the real catalog:

| Service | HUNTER price |
|---------|--------------|
| Spreadsheet Elimination | $18,500 |
| KPI Command Center | $24,000 |
| CNC Telemetry | $35,000 |
| Die Tryout Bridge | $28,000 |
| Wire Harness QA | $22,000 |
| 3PL Dashboard | $32,000 |
| Website Sprint | $15,000 |
