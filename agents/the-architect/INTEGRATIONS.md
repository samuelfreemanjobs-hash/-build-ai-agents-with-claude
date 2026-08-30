# Ops Portal Integrations — Freeman Intelligence

Wire live metrics from ESP, Amazon KDP, and Stripe into `website/ops/data/` for the internal dashboard.

---

## What feeds what

| Integration | Feeds into ops portal |
|---|---|
| **ConvertKit / Beehiiv** | `subscribers`, email open rate, click rate |
| **Amazon KDP** | `kindle_units`, `kindle_royalties` |
| **Stripe checkout** | `backend_total`, `backend_revenue_pct` |
| **GitHub Actions** | Auto-sync after daily factory run |

Data lands in:

- `website/ops/data/integrations.json` — raw source status + last sync
- `website/ops/data/ops-metrics.json` — merged targets/actuals (with `auto_synced` tags)

---

## 1. Environment variables

Copy keys into `.env` locally and **GitHub Actions secrets** for automated sync:

```bash
# ESP (pick one)
ESP_PROVIDER=convertkit          # or beehiiv
CONVERTKIT_API_SECRET=...
# BEEHIIV_API_KEY=...
# BEEHIIV_PUBLICATION_ID=pub_...

# KDP — export monthly sales CSV from KDP Reports
KDP_CSV_PATH=/path/to/kdp-sales.csv

# Stripe — cohort / backend checkout
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

See `.env.example` for full list.

---

## 2. Sync commands

```bash
# Factory JSON only
./scripts/sync-ops-portal.sh

# Factory + external APIs
./scripts/sync-ops-portal.sh --with-metrics

# External APIs only
python3 scripts/sync-external-metrics.py
python3 scripts/sync-external-metrics.py --dry-run
```

---

## 3. GitHub Actions (auto-sync)

The **Architect Daily Production** workflow (`.github/workflows/architect-daily-production.yml`) after each factory run:

1. Runs `./scripts/sync-ops-portal.sh`
2. Runs `scripts/sync-external-metrics.py` (uses repo secrets)
3. Commits `website/ops/data/` if changed

Add these GitHub secrets when ready:

| Secret | Required for |
|---|---|
| `ESP_PROVIDER` | ESP sync |
| `CONVERTKIT_API_SECRET` | ConvertKit |
| `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` | Beehiiv |
| `KDP_CSV_PATH` | KDP (path on runner — usually manual upload instead) |
| `STRIPE_SECRET_KEY` | Stripe monthly revenue pull |

Deploy updated JSON to Hostinger after CI commits, or rely on webhook for real-time Stripe.

---

## 4. Hostinger (PHP)

Copy `website/ops/api/config.example.php` → `config.php` (never commit):

```php
return [
    'esp_provider' => 'convertkit',
    'convertkit_api_secret' => '...',
    'stripe_webhook_secret' => 'whsec_...',
    'sync_token' => 'long-random-token',
];
```

| Endpoint | Purpose |
|---|---|
| `POST ops/api/stripe-webhook.php` | Real-time backend revenue on checkout |
| `POST ops/api/import-kdp.php` | Upload KDP CSV from Analytics view |
| `POST ops/api/sync-integrations.php?token=...` | Cron-triggered Python sync on server |

**Stripe webhook:** Dashboard → Webhooks → `checkout.session.completed` → URL above.

---

## 5. Portal UI

**Marketing Analytics → Live Integrations** shows source status, last sync, and metrics.

Metrics with a green **live** badge are auto-synced (manual edits can still override until next sync).

---

## 6. KDP note

Amazon does not expose a public KDP sales API. Options:

1. Export CSV from KDP Reports → set `KDP_CSV_PATH` for Python sync
2. Upload CSV in the ops portal Analytics view (Hostinger PHP)

---

See also: `INTERNAL-OPS-PORTAL.md` · `OPERATOR-SETUP.md` · `strategy/KPI-DEFINITIONS.md`
