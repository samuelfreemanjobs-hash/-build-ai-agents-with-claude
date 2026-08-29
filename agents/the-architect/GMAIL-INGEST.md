# Gmail Ingestion — Kennedy & Kern Email Swipe (One-Time)

Build a massive annotated email swipe file from **all inbox emails from Dan Kennedy and Frank Kern**.

Output lands in `agents/the-architect/swipes/kennedy-kern/`:
- `KENNEDY-KERN-EMAIL-SWIPE.md` — full annotated swipe
- `EMAIL-PATTERNS-LEARNED.md` — psychology pattern summary
- `raw.json` — structured archive

Subject lines also sync into Architect memory for future drafts.

---

## Prerequisites

1. **Google Cloud project** with Gmail API enabled
2. **OAuth 2.0 Desktop credentials** (`credentials.json`)
3. **Python package installed:** `pip install -e .`

---

## Step 1: Google Cloud setup (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. **APIs & Services → Library** → enable **Gmail API**
4. **APIs & Services → Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Desktop app**
6. Download JSON → save as:

```
agents/the-architect/credentials.json
```

7. **OAuth consent screen** → add your Gmail as a test user (if app is in Testing mode)

---

## Step 2: Authenticate (one time)

```bash
the-architect ingest-gmail --auth
```

This opens a browser. Sign in with the Gmail account that has Kennedy/Kern emails. Grant **read-only** access.

Token saved to `agents/the-architect/.gmail-token.json` (gitignored).

---

## Step 3: Dry run (optional)

See how many emails match before full ingest:

```bash
the-architect ingest-gmail --dry-run
```

---

## Step 4: Run full ingestion

```bash
the-architect ingest-gmail
```

Fetches **all matching inbox emails** and builds swipe files. May take a few minutes for large inboxes.

### Options

```bash
# Limit for testing
the-architect ingest-gmail --max 50

# Custom Gmail search query
the-architect ingest-gmail --query 'in:inbox from:magneticmarketing.com'

# Re-authenticate
the-architect ingest-gmail --auth
```

---

## What gets searched

Default query (inbox only):

- **Kennedy:** magneticmarketing.com, gkic.com, nobsinnercircle.com, dankennedy.com, glazerkennedy.com, "dan kennedy"
- **Kern:** frankkern.com, masscontrol.com, "frank kern", kernenterprises.com

Customize with `--query` if your emails use different senders.

---

## What gets learned

### Kennedy patterns detected
PAS, Urgency, Proof, Story, Offer, Contrarian, CTA, P.S.

### Kern patterns detected
Conversation, ResultsFirst, Identity, Story, FuturePace, SoftSell, PatternInterrupt, Mechanism

### Plus
- Opening type classification (question, story, direct, contrarian, news)
- Subject line trait analysis
- Pattern frequency summary across full corpus

---

## Security

| File | Git | Contains |
|---|---|---|
| `credentials.json` | **Never commit** | OAuth client secret |
| `.gmail-token.json` | **Never commit** | Your access token |
| `swipes/kennedy-kern/raw.json` | Your choice | Email content — keep private if sensitive |
| `KENNEDY-KERN-EMAIL-SWIPE.md` | Your choice | Annotated excerpts |

Add to `.gitignore` if you don't want email content in the repo.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `credentials.json not found` | Download from Google Cloud Console |
| `Access blocked` | Add your email as test user in OAuth consent screen |
| `0 emails found` | Run `--dry-run`; try `--query 'from:kennedy'` to debug |
| Token expired | Run `the-architect ingest-gmail --auth` again |

---

## After ingestion

The Architect automatically:
- Loads email patterns from `EMAIL-PATTERNS-LEARNED.md` when you reference swipes
- Has subject lines in `memory/` for headline drafting
- Uses Kennedy/Kern methodology files alongside the corpus

**Ethics:** Study structure and psychology. Write original copy. Never paste Kennedy/Kern emails into client work.
