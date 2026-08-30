# KPI Definitions — Freeman Intelligence

**Purpose:** Single source of truth for metrics referenced across plans, scorecards, and GOO reviews.  
**Refresh:** Name numeric targets monthly in the active `projects/.../plans/YYYY-MM-marketing-ops-plan.md`.

---

## North-star metrics (Year 1)

| KPI | Definition | Formula | M12 direction |
|---|---|---|---|
| **Buyer list size** | Unique email subscribers with permission | ESP count | ↑ |
| **Kindle buyers acquired** | Unique customers who purchased any PM title | KDP + direct | ↑ |
| **Backend revenue %** | Non-royalty revenue ÷ total revenue | Monthly | >50% |
| **Buyer attach rate** | Book buyers who purchase backend within 90 days | Backend buyers ÷ book buyers | ↑ |
| **LTV:CAC** | Lifetime value ÷ customer acquisition cost | Cohort-based | >3:1 |
| **Catalog depth** | Live Kindle titles (FI-000 + pipeline) | Count | 11 |
| **Chapters shipped** | Factory chapters completed | `factory/state.json` history | Per plan |
| **Tests run** | Powers one-variable tests logged | Weekly GOO | ≥1/week |
| **Partner asks** | Outbound JV/speak/deal requests sent | Manual log | ≥4/month |

---

## Funnel stage metrics

| Stage | Metric | Definition |
|---|---|---|
| **Awareness** | Impressions | LinkedIn + X + ad reach |
| **Capture** | Opt-in rate | Opt-ins ÷ landing page sessions |
| **Nurture** | Email CTR | Clicks ÷ delivered |
| **Convert** | Purchase rate | Buyers ÷ waitlist or cart sessions |
| **Ascend** | Attach rate | Backend buyers ÷ Kindle buyers (90d) |

---

## Content metrics (Guru Blueprint)

| Metric | Target | Notes |
|---|---|---|
| **Teach / proof / promo ratio** | 70 / 20 / 10 | Planned per month |
| **Posts per week** | 3–5 | Platform-native |
| **Free line installs** | Downloads of lead magnet | DR rubric, toolkits |
| **Save rate** | Saves ÷ impressions | LinkedIn quality signal |

---

## Factory metrics

| Metric | Definition |
|---|---|
| **Chapters completed** | Cumulative in `factory/state.json` |
| **Outline status** | Complete / in progress / not started |
| **Days since last chapter** | Streak risk indicator |
| **Launch assets pack** | Cover, description, back matter, email sequence — checklist % |

---

## Powers scorecard (monthly)

| Metric | Fill in monthly plan |
|---|---|
| New **buyers** (not readers) | |
| List growth | |
| Backend revenue $ | |
| Attach rate | |
| Catalog titles live | |
| Tests run | |
| Asks made | |

Source: `strategy/FREEMAN-INTELLIGENCE-POWERS-OPERATING-MODEL.md`

---

## Launch-specific (per product)

| KPI | FI-001 example |
|---|---|
| Waitlist signups | Pre-launch |
| Webinar registrants | Soft launch W3–W4 |
| Webinar show-up % | Live event |
| Founding cohort seats | $497 backend |
| Day-1 / Day-7 sales | Kindle launch window |

---

## GOO trigger thresholds (diagnose when)

| Signal | Likely bottleneck |
|---|---|
| High impressions, low opt-ins | Capture (hook / offer) |
| High opt-ins, low opens | List quality / subject lines |
| High opens, low clicks | Nurture (content / relevance) |
| High clicks, low sales | Convert (offer / proof / price) |
| High book sales, low backend | Ascend (backend sequence / timing) |

Template: `research/WEEKLY-GOO-REVIEW-TEMPLATE.md`

---

## Data sources (lock when live)

| Source | Metrics |
|---|---|
| **ESP** (TBD) | Subscribers, opens, clicks, revenue |
| **Amazon KDP** | Units, KENP, royalties |
| **Checkout** (TBD) | Backend revenue, AOV |
| **factory/state.json** | Chapters, active book |
| **Weekly GOO files** | Tests, diagnoses |

---

See also: `factory/marketing-operations-plan.json` · `strategy/MARKETING-OPERATIONS-MASTER-PLAN.md`
