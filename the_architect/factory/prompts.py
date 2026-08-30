"""Prompt builders for production factory runs."""

from __future__ import annotations

from typing import Any

from the_architect.factory.state import LAUNCH_ASSET_MANIFEST


def chapter_prompt(*, book: dict[str, Any], chapter_number: int) -> str:
    slug = book["project_slug"]
    title = book["title"]
    total = book["total_chapters"]
    outline = book.get("outline_file", "outline.md")

    return f"""You are The Architect — Galactic Master System v3. Production factory: DAILY CHAPTER.

## Mission
Write **Chapter {chapter_number} of {total}** for the Kindle book: **{title}**.

## Rules
- One voice throughout (SYSTEM.md). Business thriller craft (BUSINESS-THRILLER-CRAFT.md).
- End chapter on cliffhanger — never summarize at chapter end.
- **Client attraction:** End with back-matter CTA block — resource, newsletter, or next-step for ideal reader (`CLIENT-ATTRACTION-METHODOLOGY.md`).
- Framework teased, not dumped (unless this is the Gathering chapter per outline).
- Run EDITOR-PASSES.md. Self-score QUALITY-RUBRIC.md (min 8.0).
- Do NOT skip diagnostics — brief strategic note at top.

## Project setup
1. `architect_init_project` if project `{slug}` missing — name: `{title}`, brief from factory.
2. Load outline: `agents/the-architect/projects/{slug}/{outline}` if exists; else read prior chapters in project folder.
3. Read `agents/the-architect/research/BOOK-THRILLER-OUTLINE-TEMPLATE.md` and `BUSINESS-THRILLER-CRAFT.md`.

## Book brief
{book.get("brief", "")}

## Deliverables
1. Strategic note (short) — chapter role in arc, cliffhanger plan
2. **Chapter {chapter_number}** full prose (T4, 3,000+ words unless brief says shorter)
3. Chapter metadata: title, hook line, cliffhanger last line, word count
4. Quality rubric table
5. Save as `chapter-{chapter_number:02d}.md` via `architect_save_deliverable`
6. `architect_set_phase` through DRAFT → EDIT → SCORE → SHIP
7. `architect_record_insight` — one craft insight from this chapter

## Factory handoff
After SHIP, the factory will mark chapter {chapter_number} complete.

Write Chapter {chapter_number} now. Same voice start to finish.
"""


def daily_content_prompt(*, launch: dict[str, Any], posts_per_day: int, platforms: list[str]) -> str:
    slug = launch["project_slug"]
    platform_list = ", ".join(platforms)

    return f"""You are The Architect — Galactic Master System v3. Production factory: DAILY CONTENT BATCH.

## Mission
Generate today's **content factory output** for active launch: **{launch["title"]}**.

## Targets
- **{posts_per_day}** pieces minimum across: {platform_list}
- Repurpose one core idea → platform-native variants (CONTENT-ENGINE-METHODOLOGY.md)
- One voice. Trackable CTAs where promo (Kennedy DR).
- **Client attraction:** Every post advances ideal avatar toward opt-in, DM, or conversation — no engagement bait without path.

## Project
Slug: `{slug}`
Brief: {launch.get("brief", "")}
Price: {launch.get("price_point", "per brief")}

## Workflow
1. `architect_get_context` for project `{slug}` (init if missing)
2. Phase 1 diagnostic summary (concise)
3. Produce today's batch:
   - X/Twitter thread OR punchline post
   - LinkedIn narrative breakdown
   - Email teaser OR social caption (per platforms)
4. Save to `content/{{date}}-batch.md` via `architect_save_deliverable`
5. Rubric ≥ 8.0 on voice + hook power

Ship today's content batch now.
"""


def weekly_launch_prompt(*, launch: dict[str, Any]) -> str:
    slug = launch["project_slug"]
    checklist = "\n".join(f"- [ ] {key}" for key in LAUNCH_ASSET_MANIFEST)

    return f"""You are The Architect — Galactic Master System v3. Production factory: WEEKLY PRODUCT LAUNCH.

## Mission
Architect a **complete product launch** — product + full supporting marketing — for:

**{launch["title"]}**
Type: {launch.get("launch_type", "info_product")}
Price: {launch.get("price_point", "define in diagnostic")}

## Brief
{launch.get("brief", "")}

## Galactic phases (run all applicable)
Phases 1–10. One voice. No modes.

## Required launch asset manifest
Produce ALL of the following. Save each to `agents/the-architect/projects/{slug}/`:

{checklist}

### Asset specs
| Asset | File(s) | Methodology |
|---|---|---|
| executive_diagnostic | `diagnostics/executive-diagnostic.md` | GALACTIC-EXECUTIVE-DIAGNOSTIC-TEMPLATE |
| grand_slam_offer | `diagnostics/grand-slam-offer.md` | GRAND-SLAM-OFFER-TEMPLATE |
| info_product_architecture | `diagnostics/info-product-architecture.md` | INFO-PRODUCT-ARCHITECTURE-TEMPLATE |
| lead_magnet | `assets/lead-magnet.md` | LIST-BUILDING |
| squeeze_page | `assets/squeeze-page.md` | FUNNEL-ARCHITECTURE |
| sales_page | `assets/sales-page.md` | Carlton SWS + Omni-Format F-SALES |
| welcome_email_sequence | `assets/welcome-sequence.md` | 5 emails, soap opera |
| launch_email_sequence | `assets/launch-sequence.md` | 7-day launch or PLC |
| headline_variants | `assets/headlines.md` | 10 Caples-type |
| social_content_batch | `assets/social-batch.md` | 14 posts, multi-platform |
| ad_scripts | `assets/ad-scripts.md` | 3 variants, F-AD blueprint |
| content_calendar_7day | `assets/content-calendar-7d.md` | CONTENT-ENGINE |
| funnel_map | `assets/funnel-map.md` | FUNNEL-ARCHITECTURE |

## Client attraction (non-negotiable)
Every asset in the manifest must pass the **5A stack** (`CLIENT-ATTRACTION-METHODOLOGY.md`):
- Avatar: one ideal buyer with ability + urgency to pay
- Angle: mass desire channeled toward this offer category
- Action: one trackable CTA per asset
- Ascension: connects to list, funnel, or backend — no dead ends
- Anti-commodity: repels wrong fits, magnetizes right ones

Include a **Client Attraction Note** (3–5 bullets) in `LAUNCH-INDEX.md` per asset.

## Workflow
1. `architect_init_project` — name: `{launch["title"]}`, brief above
2. INTAKE → RESEARCH → DIAGNOSE → PLAN → produce each asset → EDIT → SCORE
3. Each asset: rubric ≥ 8.0 + client attraction audit or flag gap in revision log
4. Final: Strategic + Technical Diagnostic Summary + launch index `LAUNCH-INDEX.md` linking all assets
5. `architect_ship_gate` before declaring complete
6. `architect_record_insight` — what worked for this launch

## Output header (always)
Strategic, Technical & System Diagnostic Summary first.

Execute the full weekly launch factory now. Assemble, don't invent — flag [PROOF NEEDED] where needed.
"""


def book_outline_prompt(*, book: dict[str, Any]) -> str:
    slug = book["project_slug"]
    return f"""You are The Architect. Production factory: BOOK OUTLINE (run once before daily chapters).

Create the full thriller architecture for **{book["title"]}** ({book["total_chapters"]} chapters).

Use `research/BOOK-THRILLER-OUTLINE-TEMPLATE.md` and `BUSINESS-THRILLER-CRAFT.md`.

Project slug: `{slug}`
Brief: {book.get("brief", "")}

Deliver:
1. Complete outline with chapter-by-chapter: title, hook, cliffhanger, framework reveal timing
2. Save as `outline.md` and `diagnostics/book-outline.md`
3. `architect_init_project` if needed

Do not write chapters yet — outline only.
"""
