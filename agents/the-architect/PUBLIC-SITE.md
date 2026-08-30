# Public Site — Freeman Intelligence

**Deploy root:** `website/public/` → Hostinger `public_html/`  
**Domain:** freemanintelligence.com

---

## Pages

| URL | Path | Purpose |
|---|---|---|
| `/` | `index.html` | **DR squeeze** — Revenue Intel Briefing form (ICP + niche → email) |
| `/waitlist/` | `waitlist/index.html` | FI-001 launch waitlist · tag `waitlist` |
| `/rubric/` | `rubric/index.html` | DR rubric lead magnet · tag `lead_rubric` |
| `/cohort/` | `cohort/index.html` | Dual-Intel Systems Lab $497 · tag `cohort_interest` |
| `/api/revenue-intel-briefing.php` | Generates + emails personalized Revenue Intel Briefing |
| `/downloads/dr-rubric-install.html` | Printable rubric (save as PDF) |

**Internal (separate):** `/ops/` — password-protected backend dashboard

**Strategy:** `agents/the-architect/strategy/OPPORTUNITY-DISCOVERY.md`

---

## Offer stack (M1)

| Offer | Price | ESP tag | Role |
|---|---|---|---|
| **Revenue Intel Briefing** | Free | `revenue_intel_briefing` | ICP + niche → personalized briefing emailed |
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

### Revenue Intel Briefing (email delivery)

**Flow:** Homepage form → `POST /api/revenue-intel-briefing.php` → **Revenue Intel Agent** (Gemini + Google Search) → HTML email → lead saved · archived to `data/briefings/`

**Agent prompt:** `agents/the-architect/prompts/REVENUE-INTEL-AGENT-GEM.md` (deployed copy: `api/lib/REVENUE-INTEL-AGENT-GEM.md`)

**Hostinger setup:**

1. Copy `website/public/api/config.example.php` → `config.php` on server
2. Create `briefings@freemanintelligence.com` in hPanel → **Emails**
3. Set in `config.php`:

```php
'mail_from' => 'briefings@freemanintelligence.com',
'mail_reply_to' => 'samuel@freemanintelligence.com',
'gemini_api_key' => '...',  // required for full agent briefings (else template fallback)
'gemini_model' => 'gemini-2.0-flash',
'webhook_url' => 'https://hooks.zapier.com/...',  // optional — ConvertKit/Beehiiv
```

4. Deploy: `python3 scripts/deploy-public-site.py`
5. Submit homepage form → check inbox + `public_html/data/briefings/` archive

**ESP tag:** `revenue_intel_briefing`

**What's in the emailed briefing** (personalized to ICP + niche):

| Section | Content |
|---|---|
| Scope & evidence | Dated sources, tier classification, forcing functions |
| Opportunities | 0–3 ranked cards (Validated / Hypothesis only) |
| Operator summary | Churn signals · funnel leak · backend attach · 48h win · checklist |

Without `gemini_api_key`, a niche-profile **template** briefing is sent (yellow notice in email).

**Local test:**

```bash
# Template fallback (PHP)
php scripts/test-revenue-intel-briefing.php "Samuel" "B2B SaaS founders at \$1-5M ARR" "content agency"
# Preview: website/public/data/briefings/test-preview.html

# Full agent via Gemini API (Python — set GEMINI_API_KEY in .env)
python3 scripts/test-revenue-intel-briefing.py "Samuel" "B2B SaaS founders at \$1-5M ARR" "content agency"
# Preview: website/public/data/briefings/test-agent-preview.html
```

---

See also: `OPERATOR-SETUP.md` · `INTERNAL-OPS-PORTAL.md`
