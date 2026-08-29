# Build AI Agents with Claude

Agent library for high-performance AI copywriters, marketers, and business writers.

## The Architect

Elite direct-response copywriter + Cosmopolitan cover blurb ghostwriter + National Enquirer headline writer + Pagan/Woodsmall-style teacher + marketing systems architect.

**Now available as an agentic AI agent** — autonomously plans, researches, diagnoses, writes, edits, scores, and ships.

**Location:** [`agents/the-architect/`](agents/the-architect/)  
**Runtime:** [`the_architect/`](the_architect/) (Python + Claude Agent SDK)

---

## Agentic mode (autonomous agent)

The Architect runs as a **Claude Agent SDK** agent with custom tools for project state, diagnostics, and deliverables.

### Setup

```bash
pip install -e .
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
```

### Run one task

```bash
the-architect run "Write a sales page for my confidence course. Avatar: women 38-52 re-entering dating. [paste reviews]"
```

### Daily headline learning (memory)

The Architect collects and learns from headline swipes daily — Buzzhead (BuzzFeed-style), Cosmo, National Enquirer, proven DR headlines, and sales letter headlines.

```bash
# Run now (also runs on environment start)
the-architect learn

# Inspect memory
the-architect memory
```

Automated via GitHub Actions (daily 06:00 UTC). See [`MEMORY.md`](agents/the-architect/MEMORY.md).

### Kennedy & Kern email swipe (one-time Gmail)

Ingest all Kennedy and Kern emails from your inbox into a massive annotated swipe file:

```bash
# 1. Set up Google OAuth — see GMAIL-INGEST.md
# 2. Authenticate once
the-architect ingest-gmail --auth
# 3. Dry run
the-architect ingest-gmail --dry-run
# 4. Full ingest
the-architect ingest-gmail
```

Output: `agents/the-architect/swipes/kennedy-kern/`

Or from a brief file:

```bash
the-architect run --file my-brief.txt
```

### Interactive session

```bash
the-architect chat
```

### What the agent does autonomously

```
INTAKE → RESEARCH → DIAGNOSE → PLAN → DRAFT → EDIT → SCORE → REVISE → SHIP
```

- Initializes project state under `agents/the-architect/projects/<slug>/`
- Runs Kennedy 10Q, Caples headlines, Cialdini, Sugarman, story arc, etc. based on task
- Executes all 6 editor passes
- Self-scores with quality rubric (min 8.0)
- Saves deliverables + diagnostics to project folder

See [`agents/the-architect/AGENT.md`](agents/the-architect/AGENT.md) for the full orchestration spec.

### Custom tools

| Tool | Purpose |
|------|---------|
| `architect_init_project` | Create project + brief |
| `architect_set_phase` | Advance workflow phase |
| `architect_get_context` | Brief, state, next steps |
| `architect_save_deliverable` | Save final copy |
| `architect_record_rubric` | Record quality scores |
| `architect_ship_gate` | Verify ready to ship |
| `architect_list_knowledge` | List methodology files |
| `architect_get_memory` | Recent headline learnings + craft insights |
| `architect_record_insight` | Log post-SHIP craft learning |
| `architect_run_daily_learning` | On-demand swipe collection |

Built-in: `Read`, `Write`, `Edit`, `Grep`, `Glob` for craft files.

---

## Cursor mode (IDE)

1. Open Agent chat.
2. *"You are The Architect. One voice. Follow agents/the-architect/DR-SPECIALIST-PROMPT.md and SYSTEM.md"*
3. Fill in [`INVOCATION.md`](agents/the-architect/INVOCATION.md) with your project.
4. Same voice for headlines, sales pages, emails, books — no mode switching.

---
| File | Purpose |
|---|---|
| [`DR-SPECIALIST-PROMPT.md`](agents/the-architect/DR-SPECIALIST-PROMPT.md) | Production orchestration — role, execution engine, methodology router, output contract |
| [`AGENT.md`](agents/the-architect/AGENT.md) | Agentic orchestration — autonomous workflow state machine |
| [`SYSTEM.md`](agents/the-architect/SYSTEM.md) | Core system prompt (load this in your agent) |
| [`INVOCATION.md`](agents/the-architect/INVOCATION.md) | Project brief template — fill and paste per session |
| [`EDITOR-PASSES.md`](agents/the-architect/EDITOR-PASSES.md) | 6-pass revision protocol (never ship first drafts) |
| [`QUALITY-RUBRIC.md`](agents/the-architect/QUALITY-RUBRIC.md) | Self-scoring rubric before delivery |
| [`CRAFT-PLAYBOOKS.md`](agents/the-architect/CRAFT-PLAYBOOKS.md) | Genre structures (email, sales page, VSL, book, ads) |
| [`MICRO-COPY-LAB.md`](agents/the-architect/MICRO-COPY-LAB.md) | Cosmo + Enquirer pattern library |
| [`SWIPE-FILE.md`](agents/the-architect/SWIPE-FILE.md) | Annotated copy examples (structure, not plagiarism) |
| [`MEMORY.md`](agents/the-architect/MEMORY.md) | Persistent memory + daily headline swipe learning |
| [`GMAIL-INGEST.md`](agents/the-architect/GMAIL-INGEST.md) | One-time Kennedy/Kern Gmail email swipe ingestion |
| [`OBJECTIONS.md`](agents/the-architect/OBJECTIONS.md) | Objection library + rebuttal frames |
| [`VOC-RESEARCH.md`](agents/the-architect/VOC-RESEARCH.md) | Voice-of-customer research protocol |
| [`HALBERT-METHODOLOGY.md`](agents/the-architect/HALBERT-METHODOLOGY.md) | Gary Halbert: starving crowd, A-Pile, AIDA, offers |
| [`KERN-METHODOLOGY.md`](agents/the-architect/KERN-METHODOLOGY.md) | Frank Kern: Results in Advance, IBB, funnels, Core Identity |
| [`HOPKINS-METHODOLOGY.md`](agents/the-architect/HOPKINS-METHODOLOGY.md) | Claude Hopkins: scientific advertising, reason-why, specificity, testing |
| [`KENNEDY-METHODOLOGY.md`](agents/the-architect/KENNEDY-METHODOLOGY.md) | Dan Kennedy: Magnetic Marketing, PAS, 10 Questions, offers |
| [`ABRAHAM-METHODOLOGY.md`](agents/the-architect/ABRAHAM-METHODOLOGY.md) | Jay Abraham: Preeminence, N×V×F growth, Parthenon, risk reversal |
| [`CIALDINI-METHODOLOGY.md`](agents/the-architect/CIALDINI-METHODOLOGY.md) | Robert Cialdini: seven principles, pre-suasion, ethical influence |
| [`CAPLES-METHODOLOGY.md`](agents/the-architect/CAPLES-METHODOLOGY.md) | John Caples: tested headlines, story ads, before/after, split-run testing |
| [`SCHWARTZ-METHODOLOGY.md`](agents/the-architect/SCHWARTZ-METHODOLOGY.md) | Eugene Schwartz: mass desire, awareness × sophistication, breakthrough advertising |
| [`COLLIER-METHODOLOGY.md`](agents/the-architect/COLLIER-METHODOLOGY.md) | Robert Collier: mental conversation, bait principle, six essentials |
| [`HAINES-METHODOLOGY.md`](agents/the-architect/HAINES-METHODOLOGY.md) | Scott Haines: shortcut copywriting, Headline→P.S., bucket brigade, blind bullets |
| [`CARLTON-METHODOLOGY.md`](agents/the-architect/CARLTON-METHODOLOGY.md) | John Carlton: Theatre/Salesmanship/Bonding, sales detective, hook engineering, SWS 17 steps |
| [`CELEBRITY-BUILDING-METHODOLOGY.md`](agents/the-architect/CELEBRITY-BUILDING-METHODOLOGY.md) | Authority from thin air: origin myth, polarity, proof cascade, 90-day celebrity sprint |
| [`SUGARMAN-METHODOLOGY.md`](agents/the-architect/SUGARMAN-METHODOLOGY.md) | Joe Sugarman: slippery slide, 31 triggers, emotion→logic, mail-order craft |
| [`MASTER-STORYTELLERS.md`](agents/the-architect/MASTER-STORYTELLERS.md) | Aristotle, Homer, Shakespeare, Campbell, Hemingway — narrative genius stack |
| [`BUSINESS-THRILLER-CRAFT.md`](agents/the-architect/BUSINESS-THRILLER-CRAFT.md) | Hitchcock, Christie, Patterson — thriller/mystery craft for business books |
| [`research/KENNEDY-10Q-TEMPLATE.md`](agents/the-architect/research/KENNEDY-10Q-TEMPLATE.md) | Pre-copy diagnostic template |
| [`research/ABRAHAM-LEVERS-TEMPLATE.md`](agents/the-architect/research/ABRAHAM-LEVERS-TEMPLATE.md) | Three-lever and offer scan template |
| [`research/CIALDINI-PRINCIPLES-TEMPLATE.md`](agents/the-architect/research/CIALDINI-PRINCIPLES-TEMPLATE.md) | Seven-principle and pre-suasion audit template |
| [`research/CAPLES-HEADLINE-TEST-TEMPLATE.md`](agents/the-architect/research/CAPLES-HEADLINE-TEST-TEMPLATE.md) | 10 headline variants + split-test plan |
| [`research/SCHWARTZ-MARKET-DIAGNOSIS-TEMPLATE.md`](agents/the-architect/research/SCHWARTZ-MARKET-DIAGNOSIS-TEMPLATE.md) | Mass desire, functional angle, awareness, sophistication |
| [`research/COLLIER-CONVERSATION-TEMPLATE.md`](agents/the-architect/research/COLLIER-CONVERSATION-TEMPLATE.md) | Mental conversation, bait, six essentials |
| [`research/HAINES-COPY-WORKFLOW-TEMPLATE.md`](agents/the-architect/research/HAINES-COPY-WORKFLOW-TEMPLATE.md) | Headline to P.S. linear copy assembly |
| [`research/CARLTON-SWS-TEMPLATE.md`](agents/the-architect/research/CARLTON-SWS-TEMPLATE.md) | Carlton Simple Writing System 17-step checklist |
| [`research/CELEBRITY-FABRICATION-TEMPLATE.md`](agents/the-architect/research/CELEBRITY-FABRICATION-TEMPLATE.md) | 90-day celebrity / authority build worksheet |
| [`SOURCES-HAINES.md`](agents/the-architect/SOURCES-HAINES.md) | Scott Haines source provenance |
| [`SOURCES-CARLTON.md`](agents/the-architect/SOURCES-CARLTON.md) | John Carlton source provenance |
| [`research/SUGARMAN-TRIGGER-AUDIT-TEMPLATE.md`](agents/the-architect/research/SUGARMAN-TRIGGER-AUDIT-TEMPLATE.md) | Slippery slide + psychological trigger audit |
| [`research/STORY-ARC-TEMPLATE.md`](agents/the-architect/research/STORY-ARC-TEMPLATE.md) | Five-genius story arc (Aristotle → Hemingway) |
| [`research/BOOK-THRILLER-OUTLINE-TEMPLATE.md`](agents/the-architect/research/BOOK-THRILLER-OUTLINE-TEMPLATE.md) | Business book thriller map + chapter cliffhangers |
| [`HALBERT-NEWSLETTER-INDEX.md`](agents/the-architect/HALBERT-NEWSLETTER-INDEX.md) | Newsletter archive index by topic |
| [`research/VOC-LEXICON-TEMPLATE.md`](agents/the-architect/research/VOC-LEXICON-TEMPLATE.md) | Save per-project VOC output |

## Quick start (Cursor)

1. Open Agent chat.
2. *"You are The Architect. One voice. Follow agents/the-architect/SYSTEM.md"*
3. Fill in [`INVOCATION.md`](agents/the-architect/INVOCATION.md) with your project.
4. Same voice for headlines, sales pages, emails, books — no mode switching.

## What makes this writer different

- **One author voice** — five genius storytellers + DR masters (Halbert, Kern, Hopkins, Kennedy, Abraham, Cialdini, Caples, Sugarman) — same person throughout
- **8-word test first** — if the hook fails short, the long copy will too
- **Mandatory editor passes** — structural, line, punch-up, proof, CTA, ethics
- **Quality rubric** — self-scores before shipping (min 8.0 average)
- **Genre playbooks** — proven structures per asset type
- **Micro-copy lab** — 10-variant protocol with pattern diversity
- **VOC research mode** — mine real customer language before writing
- **Swipe file** — annotated examples; extract structure, not words
- **Kennedy direct response** — PAS, 10 Questions, Magnetic Marketing triad, irresistible offers, follow-up systems
- **Cialdini persuasion** — seven principles, pre-suasion, ethical proof/scarcity, principle stacking for ads and copy
- **Caples tested advertising** — headline-first discipline, story hooks, before/after, long copy, split-run testing
- **Schwartz breakthrough advertising** — mass desire channeling, awareness × sophistication diagnosis, mechanism at stage 3+
- **Collier letter craft** — enter the mental conversation; bait principle; six essentials; emotion before reason
- **Sugarman slippery slide** — momentum copy, 31 triggers, emotion→logic, seeds of curiosity, product/mail-order craft
- **Five genius storytellers** — Aristotle structure, Homer immersion, Shakespeare conflict, Campbell hero's journey, Hemingway iceberg
- **Business thriller craft** — Hitchcock suspense, Christie fair play, Patterson cliffhangers — page-turning business books
- **Objection library** — pre-built rebuttals + placement guide
- **Teaching install format** — Pagan chunking + Woodsmall distinctions

## Recommended workflow

```
1. VOC        → lexicon + objections + hook seeds
2. DR/Teach   → full asset using VOC phrases
3. Punch-up   → editor passes + rubric score
```

## Example

```
You are The Architect. One voice. Follow agents/the-architect/SYSTEM.md.

Write a sales page for my confidence course.
Avatar: women 38–52, re-entering dating after divorce.
[paste 5 customer reviews]
```
