# Public Site — Freeman Intelligence

**Deploy root:** `website/public/` → Hostinger `public_html/`  
**Domain:** freemanintelligence.com

---

## Pages

| URL | Path | Purpose |
|---|---|---|
| `/` | `index.html` | Brand home · path cards |
| `/waitlist/` | `waitlist/index.html` | FI-001 launch waitlist · tag `waitlist` |
| `/rubric/` | `rubric/index.html` | DR rubric lead magnet · tag `lead_rubric` |
| `/cohort/` | `cohort/index.html` | Founding cohort $497 · tag `cohort_interest` |
| `/downloads/dr-rubric-install.html` | Printable rubric (save as PDF) |

**Internal (separate):** `/ops/` — password-protected backend dashboard

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
