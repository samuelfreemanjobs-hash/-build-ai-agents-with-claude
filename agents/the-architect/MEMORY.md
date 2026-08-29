# The Architect — Memory & Daily Learning

The Architect **remembers** headline patterns and craft insights across sessions. Memory grows automatically via daily swipe learning.

---

## What gets stored

| Store | Path | Purpose |
|---|---|---|
| **Daily learnings** | `memory/learnings/YYYY-MM-DD.json` | Raw annotated swipes per day |
| **Pattern index** | `memory/patterns.json` | Aggregated patterns by tag (Cosmo, Enq, Buzzhead, etc.) |
| **Digest** | `memory/digest.md` | Human-readable rolling log for agent + you |
| **Master index** | `memory/index.json` | Dedup hashes, totals, source counts |
| **Craft insights** | `memory/insights.jsonl` | Post-project learnings (what worked) |

---

## Daily swipe sources

Automated collection from:

| Source key | What it teaches |
|---|---|
| `buzzfeed` | **Buzzhead** — BuzzFeed-style curiosity gap, listicles, FOMO, emotional exaggeration |
| `cosmopolitan` | **Cosmo** — identity hooks, relationship stakes, "smart women" framing |
| `national_enquirer` | **Enquirer** — insider reveals, scandal open loops, hidden truth |
| `proven_headlines` | **DR classics** — Caples, Schwartz, Ogilvy, Hopkins tested headlines |
| `salesletters` | **Sales letter headlines** — offer architecture, 4 U's, mechanism curiosity |

When live RSS feeds are unavailable (network/egress), curated seed libraries are used so learning never stops.

---

## Run manually

```bash
# Full daily run (all 5 sources)
the-architect learn

# One source, fewer headlines
the-architect learn --source buzzfeed --source cosmopolitan --limit 10

# Inspect memory
the-architect memory
```

---

## Automation (GitHub Actions)

Workflow: `.github/workflows/architect-daily-learning.yml`

- Runs **daily at 06:00 UTC**
- Collects + annotates headlines
- Commits updated `agents/the-architect/memory/` back to the repo
- Manual trigger: Actions → "Architect Daily Headline Learning" → Run workflow

---

## Agent tools

| Tool | When to use |
|---|---|
| `architect_get_memory` | Before DRAFT — recall recent headline patterns |
| `architect_record_insight` | After SHIP — log what worked for this project |
| `architect_run_daily_learning` | On demand if digest is stale |

System prompt auto-injects the 15 most recent swipes.

---

## Ethics (non-negotiable)

- Extract **structure and psychology**, never plagiarize
- Swipes inform pattern diversity — original copy only
- Same rules as `SWIPE-FILE.md`

---

## Continuous improvement loop

```
Daily swipes → pattern annotation → memory digest
       ↓
Agent reads memory at DRAFT → applies patterns in original voice
       ↓
SHIP → architect_record_insight → insights.jsonl
       ↓
Next project benefits from accumulated craft memory
```
