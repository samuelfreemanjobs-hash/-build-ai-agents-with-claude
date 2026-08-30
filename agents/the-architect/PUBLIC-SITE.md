# Public Site — Freeman Intelligence

**Deploy root:** `website/public/` → Hostinger `public_html/`  
**Domain:** freemanintelligence.com

---

## Pages

| URL | Path | Purpose |
|---|---|---|
| `/` | `index.html` | **DR squeeze** — Dual-Intel Discovery Kit + Systems Lab upsell |
| `/waitlist/` | `waitlist/index.html` | FI-001 launch waitlist · tag `waitlist` |
| `/rubric/` | `rubric/index.html` | DR rubric lead magnet · tag `lead_rubric` |
| `/cohort/` | `cohort/index.html` | Dual-Intel Systems Lab $497 · tag `cohort_interest` |
| `/downloads/marketing-intel-brief.html` | Marketing Intel Brief (4 pages) |
| `/downloads/revenue-intel-brief.html` | Revenue Intel Brief (4 pages) |
| `/downloads/dr-rubric-install.html` | Printable rubric (save as PDF) |

**Internal (separate):** `/ops/` — password-protected backend dashboard

**Strategy:** `agents/the-architect/strategy/OPPORTUNITY-DISCOVERY.md`

---

## Offer stack (M1)

| Offer | Price | ESP tag | Role |
|---|---|---|---|
| **Dual-Intel Discovery Kit** | Free | `lead_dual_intel` | Marketing Intel + Revenue Intel briefs — discover opportunity in 48h |
| **DR Rubric 10-Min Install** | Free | `lead_rubric` | Secondary free line on `/rubric/` |
| **FI-001 Waitlist** | Free | `waitlist` | Kindle launch list |
| **Dual-Intel Systems Lab** (Founding Cohort) | $497 | `cohort_interest` | Install both intel layers · 30-day implementation |

---

## Deploy

```bash
python3 scripts/deploy-public-site.py          # FTP
python3 scripts/deploy-public-site.py --dry-run
./scripts/deploy-all.sh                        # public + ops portal
```

**After deploy — permissions:**

| Path | chmod |
|---|---|
| `public_html/data/` | 755 |
| `public_html/api/` | 755 |

Leads save to `public_html/data/leads.json` (blocked from direct download via `.htaccess`).

---

## ESP integration (optional)

Copy `api/config.example.php` → `api/config.php` and set:

```php
'webhook_url' => 'https://hooks.zapier.com/...',  // ConvertKit/Beehiiv via Zapier
'checkout_url' => 'https://buy.stripe.com/...',     // cohort checkout
```

---

## Local preview

```bash
cd website/public
python3 -m http.server 8080
```

Forms need PHP on Hostinger — locally they will show errors unless you use `php -S localhost:8080`.

---

See also: `OPERATOR-SETUP.md` · `INTERNAL-OPS-PORTAL.md`
