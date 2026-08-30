# Operator Setup — Samuel Freeman / Persuasion Mechanics

**Do this once on your computer.** Keys live in `.env` locally and in GitHub Secrets for automated factory runs. **Never commit `.env`.**

---

## 1. Clone and install

```bash
git clone https://github.com/samuelfreemanjobs-hash/-build-ai-agents-with-claude.git
cd -build-ai-agents-with-claude
pip install -e .
cp .env.example .env
```

---

## 2. Claude (Anthropic) — required

**What it powers:** The Architect agent · factory (1 chapter/day) · build-agent · GitHub Actions daily production

| Step | Action |
|---|---|
| 1 | Go to [console.anthropic.com](https://console.anthropic.com) → **API Keys** |
| 2 | Create key (starts with `sk-ant-`) |
| 3 | Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...` |
| 4 | Add **GitHub repo secret** (for automated factory): Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → name `ANTHROPIC_API_KEY` |

**Verify locally:**

```bash
the-architect factory status
the-architect factory outline    # PM-001 — run once
the-architect factory chapter --dry-run   # or first real chapter
```

---

## 3. Gemini (Google) — optional but recommended

**What it powers:** Model benchmarking · alternate drafts · multimodal experiments (`AI-MODEL-BENCHMARKING-METHODOLOGY.md`)

| Step | Action |
|---|---|
| 1 | Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| 2 | Create API key |
| 3 | Add to `.env`: `GEMINI_API_KEY=...` |

Gemini is **not** used by the factory today — Claude runs all production. Gemini is for side-by-side quality tests when you want a second opinion on headlines, diagnostics, or multimodal briefs.

---

## 4. Hostinger (website) — for persuasionmechanics.com

**What it powers:** Landing pages · lead magnet capture · waitlist · cohort sales pages · DR rubric download

The Architect does not auto-deploy to Hostinger yet — you store credentials so the agent can reference them when building/deploying site assets. Deployment is manual (SFTP) or via Hostinger File Manager until we wire a deploy script.

### A. Domain (if not done)

1. Hostinger hPanel → **Domains** → register or connect `persuasionmechanics.com`
2. Point DNS to Hostinger nameservers if domain is elsewhere

### B. SFTP credentials (recommended)

1. hPanel → **Websites** → your site → **Files** → **FTP Accounts** (or SFTP)
2. Note: **Host**, **Username**, **Password**, **Port** (usually `21` FTP or `22` SFTP)

Add to `.env`:

```bash
HOSTINGER_DOMAIN=persuasionmechanics.com
HOSTINGER_SFTP_HOST=ftp.persuasionmechanics.com
HOSTINGER_SFTP_USER=your-ftp-username
HOSTINGER_SFTP_PASSWORD=your-ftp-password
HOSTINGER_SFTP_PORT=21
```

### C. WordPress (if using WordPress on Hostinger)

```bash
HOSTINGER_WP_URL=https://persuasionmechanics.com/wp-admin
HOSTINGER_WP_USER=your-admin-username
# Use app password or store in password manager — avoid plain text if possible
HOSTINGER_WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### D. Hostinger API (optional — VPS/advanced)

If you have a Hostinger API token: [developers.hostinger.com](https://developers.hostinger.com)

```bash
HOSTINGER_API_TOKEN=your-token
```

### M1 site pages to deploy (Sep 2026)

| Page | Path | Purpose |
|---|---|---|
| Home / brand | `/` | Persuasion Mechanics intro |
| Waitlist | `/waitlist` | PM-001 launch |
| DR Rubric | `/rubric` | Free line lead magnet |
| Cohort | `/cohort` | Founding cohort $497 |

See `research/WEBSITE-DESIGN-BUILD-TEMPLATE.md` and `PREMIUM-WEBSITE-DESIGN-METHODOLOGY.md` when ready to build.

### E. Internal ops portal (backend dashboard)

**Path:** `website/ops/` → upload to `public_html/ops/`  
**Guide:** `INTERNAL-OPS-PORTAL.md`

Includes: command dashboard · task kanban · marketing analytics · 12-month calendar · product pipeline · business systems library.

```bash
./scripts/sync-ops-portal.sh          # refresh JSON from factory
# SFTP upload website/ops/ to Hostinger
# hPanel → Directory Privacy → password-protect /ops/
```

**URL:** `https://persuasionmechanics.com/ops/` (internal only)

---

## 5. GitHub Secrets summary

| Secret name | Required | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** (for factory automation) | Daily production + weekly launch workflows |
| `GEMINI_API_KEY` | No | Future benchmark workflow (not wired yet) |

Hostinger credentials stay **local in `.env` only** — do not add FTP passwords to GitHub.

---

## 6. First commands after keys are set

```bash
# Confirm env loads (from repo root)
python -c "from the_architect.config import get_api_key; print('Claude:', 'OK' if get_api_key() else 'MISSING')"

# Start PM-001 factory
the-architect factory outline
the-architect factory chapter

# Interactive agent
the-architect chat
```

---

## 7. Security checklist

- [ ] `.env` exists locally · never committed (already in `.gitignore`)
- [ ] `ANTHROPIC_API_KEY` in GitHub Actions secrets
- [ ] Hostinger FTP password only in `.env`
- [ ] Rotate keys if ever exposed
- [ ] Use Hostinger app password for WordPress (not main account password)

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `ANTHROPIC_API_KEY is not set` | Copy `.env.example` → `.env` · restart terminal |
| Factory dry-runs only on GitHub | Add repo secret `ANTHROPIC_API_KEY` |
| `pip install -e .` fails | Use Python 3.11+ |
| Hostinger upload fails | Confirm port 21 vs 22 · passive mode in FTP client |

---

See also: `BRAND-IDENTITY.md` · `PRODUCTION-FACTORY.md` · `projects/persuasion-mechanics/plans/2026-09-marketing-ops-plan.md`
