# Business Plan Methodology

**Strategic planning layer for The Architect.** Rolling 12-month horizons with reserved opportunistic slots — so long-term product discipline and short-term revenue spikes coexist.

**Template:** `research/12-MONTH-BUSINESS-PLAN-TEMPLATE.md`  
**Example:** `strategy/PERSUASION-MECHANICS-12-MONTH-PLAN.md` (Samuel Freeman / Persuasion Mechanics)

---

## Business Planning in One Sentence

> **Plan 12 months of product and revenue on rails — but leave deliberate gaps where events, JVs, and market windows can slip in without wrecking the factory.**

---

## Non-negotiable rules

| Rule | Law |
|---|---|
| **12-month horizon** | Every business plan covers the next 12 months from current month — refresh monthly |
| **Opportunistic slots** | Minimum **2 OPEN months/year** (or equivalent 15–20% capacity) — no new primary product; short-term revenue only |
| **Slip-in overlay** | During PRODUCE months, opportunistic plays ≤ **20% capacity** — never pause active book factory |
| **Client attraction** | Every month names metric moved (subscribers, sales, calls, revenue) |
| **Abraham N×V×F** | Each month tags which lever it primarily moves |
| **Factory sync** | Active book/launch must match current month in `factory/business-plan.json` |

---

## Plan structure (12-month template)

```
1. BRAND & AVATAR     — who, positioning, offer ladder
2. REVENUE ARCHITECTURE — streams + target mix
3. 12-MONTH CALENDAR  — month × mode × product × opportunistic
4. OPEN MONTH PLAYBOOK — what to run when no new book
5. QUARTERLY TARGETS  — Q1–Q4 checkpoints (metrics TBD by client)
6. FACTORY SYNC       — register-book / register-launch commands
7. ROLLING REFRESH    — extend horizon on 1st of each month
```

### Month modes

| Mode | Job |
|---|---|
| **LAUNCH** | Brand + flagship product; maximum visibility |
| **PRODUCE** | Active Kindle + backend + content factory |
| **OPEN** | Opportunistic revenue; back-catalog; no new manuscript |
| **CAPSTONE** | Final catalog piece + bundle + Year N+1 seed |

---

## Opportunistic revenue types (slip-in menu)

| Type | Typical lead time | Architect assets |
|---|---|---|
| Trending news reactive | 24–48h | Thread, magnet, email |
| Webinar / challenge | 1–2 weeks | `WEBINAR-LAUNCH-TEMPLATE.md` |
| JV / affiliate | 2–3 weeks | `JV-PARTNER-PACK-TEMPLATE.md` |
| Consulting sprint | Immediate | `PROPOSAL-RFP-TEMPLATE.md` |
| Event / speaking | 1 week | Talk outline + stage offer |
| Short course | 2 weeks | Info-product architecture |
| Seasonal (BFCM etc.) | Planned | Bundle + urgency sequence |

---

## Integration with Production Factory

| Factory command | When |
|---|---|
| `factory register-book` | Start of each PRODUCE/LAUNCH month |
| `factory outline` | Week 1 of book month |
| `factory daily` | Weeks 2–4 |
| `factory register-launch` | Backend offer tied to active book |
| `factory launch` | Weekly launch slot for backend or OPEN month offer |

**Sync file:** `factory/business-plan.json` — `current_month`, `active_product_id`, `open_months`.

---

## Ship gate (business plan deliverable)

- [ ] 12 months mapped with no gaps
- [ ] ≥2 OPEN months flagged
- [ ] Each PRODUCE month has one primary Kindle + one backend action
- [ ] Opportunistic plays listed per month
- [ ] N×V×F lever tagged per quarter
- [ ] Factory commands documented for Month 1
- [ ] Metrics slots present (filled by operator)

---

See also: `BRAND-IDENTITY.md` · `PRODUCTION-FACTORY.md` · `ABRAHAM-METHODOLOGY.md`
