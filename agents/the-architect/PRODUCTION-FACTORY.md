# Production Factory

**Automated content factory · product factory · launch machine** for The Architect.

One voice. No modes. Runs on schedule via GitHub Actions + `the-architect factory` CLI.

---

## What the factory does

| Cadence | Job | CLI |
|---|---|---|
| **Daily** | ≥1 Kindle chapter (active book) | `factory chapter` / `factory daily` |
| **Daily** | Content batch for active launch (3+ posts) | `factory content` / `factory daily` |
| **Daily** | Headline swipe learning (separate workflow) | `learn` |
| **Weekly** | Full product + all marketing assets | `factory launch` |

**Target throughput:** 1 chapter/day · 1 product/week · continuous content during launch windows.

---

## Quick start

### 1. API key

```bash
cp .env.example .env
# Add ANTHROPIC_API_KEY=sk-ant-...
```

For GitHub Actions: add repo secret `ANTHROPIC_API_KEY`.

### 2. Register a Kindle book

```bash
the-architect factory register-book "The AI Copy Chief" \
  --brief "Business thriller teaching direct-response AI copywriting for founders" \
  --chapters 12

the-architect factory outline   # once — generates outline.md
the-architect factory chapter   # write today's chapter
```

### 3. Register a weekly product launch

```bash
the-architect factory register-launch "Neural Selling System" \
  --brief "$997 course — B2B founders, mechanism: 3-step AI persuasion stack" \
  --price "$997" \
  --type course

the-architect factory launch      # full 13-asset pipeline
```

### 4. Daily production (chapter + content)

```bash
the-architect factory daily
the-architect factory status
```

### 5. Dry-run (no API)

```bash
the-architect factory daily --dry-run
```

---

## Automation (GitHub Actions)

| Workflow | Schedule | File |
|---|---|---|
| Headline learning | 06:00 UTC daily | `.github/workflows/architect-daily-learning.yml` |
| **Daily production** | **07:00 UTC daily** | `.github/workflows/architect-daily-production.yml` |
| **Weekly launch** | **Monday 08:00 UTC** | `.github/workflows/architect-weekly-launch.yml` |

Outputs auto-commit to `agents/the-architect/factory/` and `agents/the-architect/projects/`.

---

## Factory state

| Path | Purpose |
|---|---|
| `factory/config.json` | Schedule, platforms, quotas (auto-created) |
| `factory/state.json` | Active book, active launch, history |
| `projects/<slug>/` | Chapters, launch assets, diagnostics |

### Schedule defaults (`config.json`)

```json
{
  "schedule": {
    "chapters_per_day_min": 1,
    "products_per_week": 1,
    "content_posts_per_day": 3,
    "daily_production_utc": "07:00",
    "weekly_launch_day": "monday"
  },
  "platforms": ["x", "linkedin", "email"]
}
```

---

## Weekly launch asset manifest (13 assets)

Produced by `factory launch` in one agentic run:

1. Executive diagnostic  
2. Grand Slam offer  
3. Info-product architecture  
4. Lead magnet  
5. Squeeze page  
6. Sales page  
7. Welcome email sequence (5)  
8. Launch email sequence (7-day)  
9. Headline variants (10)  
10. Social content batch (14 posts)  
11. Ad scripts (3)  
12. 7-day content calendar  
13. Funnel map  

Saved under `projects/<slug>/assets/` and `diagnostics/`. Index: `LAUNCH-INDEX.md`.

---

## Agent tools (MCP)

| Tool | Use |
|---|---|
| `architect_factory_status` | Quotas, active book/launch |
| `architect_factory_mark_chapter` | Mark chapter complete |
| `architect_factory_mark_launch_asset` | Check off manifest item |
| `architect_factory_complete_launch` | Archive launch to history |

---

## Production workflow map

```
                    ┌─────────────────┐
                    │  factory daily  │
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        factory:learn   factory:chapter  factory:content
        (06:00 UTC)     (Kindle)         (launch promo)

        ┌─────────────────────────────────────────┐
        │         factory launch (weekly)          │
        │  product + offer + funnel + all copy     │
        └─────────────────────────────────────────┘
```

---

## Galactic integration

Factory runs use **Galactic v3** phases 1–10. Chapter runs → `BUSINESS-THRILLER-CRAFT.md` + SWS. Launch runs → full stack (Hormozi, funnel, omni-format, audits).

**Ship gate:** Every factory output ≥ 8.0 rubric. Max 3 revision loops per `AGENT.md`.

---

## Operating rules

1. **One active book** — register new book when current completes (`next_chapter` > `total_chapters`).
2. **One active launch** — `factory complete-launch` via agent tool after ship gate, then register next week's product.
3. **Outline first** — run `factory outline` once before daily chapters.
4. **Queue launches** — register Monday's product Sunday night; workflow fires Monday 08:00 UTC.
5. **Review commits** — Actions push to repo; human reviews PR or main as your process requires.

---

See also: `AGENT.md`, `GALACTIC-MASTER-PROMPT.md`, `FRAMEWORK-WORKFLOW-ENGINE.md`, `MEMORY.md`, `AGENT-BUILDER-METHODOLOGY.md`
