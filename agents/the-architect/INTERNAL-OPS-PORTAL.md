# Internal Ops Portal — Persuasion Mechanics

**URL (after deploy):** `https://persuasionmechanics.com/ops/`  
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

### 2. Upload via SFTP

Upload entire `website/ops/` folder to:

```
public_html/ops/
```

Or subdomain: `ops.persuasionmechanics.com`

Use credentials from `.env` (`HOSTINGER_SFTP_*`).

### 3. Password protect (required)

In hPanel → **Advanced** → **Directory Privacy**, protect `/ops/`.

Or copy `.htaccess.example` → `.htaccess` and create `.htpasswd`:

```bash
htpasswd -c .htpasswd samuel
```

Upload `.htpasswd` outside `public_html` and set path in `.htaccess`.

### 4. Enable PHP (for save)

Hostinger shared hosting includes PHP. The portal saves tasks/metrics via:

- `api/save-tasks.php`
- `api/save-metrics.php`

Ensure `data/` folder is writable (chmod 755 or 775).

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

| Source | Metric |
|---|---|
| ESP (ConvertKit etc.) | Subscribers, opens, clicks |
| Amazon KDP | Kindle units, royalties |
| Stripe / checkout | Backend revenue |
| GitHub Actions | Auto-sync after factory daily run |

---

See also: `OPERATOR-SETUP.md` · `strategy/KPI-DEFINITIONS.md` · `MARKETING-OPERATIONS-PLANNING-METHODOLOGY.md`
