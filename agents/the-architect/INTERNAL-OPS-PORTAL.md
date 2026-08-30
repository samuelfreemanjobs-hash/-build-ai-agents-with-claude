# Internal Ops Portal — Freeman Intelligence

**URL (after deploy):** `https://freemanintelligence.com/ops/`  
**Access:** Internal only — password-protect with `.htaccess`  
**Source:** `website/ops/`

---

## What it includes

| View | Purpose |
|---|---|
| **Dashboard** | Command center — KPIs, factory progress, month focus, funnel health, ascension ladder |
| **Task Board** | Kanban — backlog → this week → in progress → done (drag & drop) |
| **Marketing Analytics** | Targets vs actuals, progress charts, funnel radar, revenue split, Powers scorecard |
| **12-Month Calendar** | LAUNCH / PRODUCE / OPEN / CAPSTONE timeline |
| **Product Pipeline** | Published catalog + Year 1 pipeline + ascension paths |
| **Business Systems** | Methodology library + templates + planning laws |

---

## Deploy to Hostinger

### 1. Sync data from repo

```bash
./scripts/sync-ops-portal.sh
```

Run after factory updates or before each deploy.

### 2. Upload via SFTP/FTP

**Automated (run on your computer after `.env` has real Hostinger credentials):**

```bash
./scripts/sync-ops-portal.sh
python3 scripts/deploy-ops-portal.py          # FTP (port 21)
python3 scripts/deploy-ops-portal.py --sftp   # SFTP (port 22) if FTP fails
python3 scripts/deploy-ops-portal.py --dry-run
```

One command:

```bash
./scripts/deploy-ops-portal.sh
```

**Manual (FileZilla):** Upload entire `website/ops/` to:

```
public_html/ops/
```

Or subdomain: `ops.freemanintelligence.com`

Use credentials from `.env` (`HOSTINGER_SFTP_*`).

### 3. Password protect (required)

**Option A — hPanel (recommended, no files needed)**

1. hPanel → **Advanced** → **Directory Privacy**
2. Select folder `public_html/ops`
3. Create username + password (e.g. `samuel`)
4. Save

**Option B — `.htaccess` Basic Auth**

```bash
./scripts/setup-ops-auth.sh
```

This creates:
- `website/ops/.htpasswd` → upload **outside** `public_html` (see script output for path)
- `website/ops/.htaccess` → upload to `public_html/ops/.htaccess`

Or copy `.htaccess.example` → `.htaccess` and set `AuthUserFile` to your Hostinger path.

**Never commit `.htpasswd` or `.htaccess`** (already in `.gitignore`).

### 4. Preview locally (before upload)

```bash
cd website/ops
python3 -m http.server 8080
```

Open **http://localhost:8080** — no password locally; auth only applies on Hostinger after deploy.

Note: PHP save won't work locally; tasks/metrics use browser localStorage until deployed.

### 5. PHP save (tasks & metrics on Hostinger)

Hostinger shared hosting includes PHP. After deploy:

| Button | Writes to |
|---|---|
| **Save tasks** | `data/ops-tasks.json` |
| **Save metrics** | `data/ops-metrics.json` |

**Verify PHP is working:**

```
https://freemanintelligence.com/ops/api/health.php
```

Should return `"ok": true` and `"data_dir_writable": true`.

**If save fails — fix permissions (hPanel File Manager):**

| Path | Permission |
|---|---|
| `public_html/ops/data/` | **755** or **775** |
| `public_html/ops/data/ops-tasks.json` | **644** or **664** |
| `public_html/ops/data/ops-metrics.json` | **644** or **664** |

The folder must be **writable by PHP**. On save success you'll see: `Saved to server (2026-09-01)`.

Backups: previous version saved as `ops-tasks.json.bak` / `ops-metrics.json.bak`.

---

## Data flow

```
agents/the-architect/factory/*.json  ──sync──►  website/ops/data/
agents/the-architect/strategy/*.json

Portal edits (tasks/metrics)  ──POST──►  api/save-*.php  ──►  data/ops-*.json
```

**Read-only (synced):** state, business-plan, marketing-ops, catalogs, ascension  
**Editable (portal):** ops-tasks.json, ops-metrics.json

---

## Local preview

```bash
cd website/ops
python3 -m http.server 8080
# Open http://localhost:8080
```

Note: PHP save won't work in Python server — uses localStorage fallback.

---

## Future integrations

| Source | Metrics | Setup |
|---|---|---|
| **ESP** (ConvertKit / Beehiiv) | Subscribers, opens, clicks | `.env`: `ESP_PROVIDER`, API keys · GitHub secrets for CI |
| **Amazon KDP** | Kindle units, royalties | Export CSV → `KDP_CSV_PATH` or upload in Analytics view |
| **Stripe / checkout** | Backend revenue | `STRIPE_SECRET_KEY` + webhook → `api/stripe-webhook.php` |
| **GitHub Actions** | Auto-sync after factory | Runs daily after `architect-daily-production` workflow |

**Sync locally:**

```bash
./scripts/sync-ops-portal.sh --with-metrics   # factory JSON + external APIs
python3 scripts/sync-external-metrics.py      # ESP/KDP/Stripe only
```

**Hostinger cron (optional):** POST to `ops/api/sync-integrations.php?token=OPS_SYNC_TOKEN`

**Docs:** `INTEGRATIONS.md` · `strategy/KPI-DEFINITIONS.md`

---

See also: `OPERATOR-SETUP.md` · `strategy/KPI-DEFINITIONS.md` · `MARKETING-OPERATIONS-PLANNING-METHODOLOGY.md`
