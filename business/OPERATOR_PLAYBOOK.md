# HUNTER Intelligence — Solo Operator Playbook

You are the only human. The system does everything else. Your job: **decide, sell, deliver oversight, collect money.**

## Daily Routine (90 minutes)

### Morning Block (45 min) — Revenue
1. Open Operator Dashboard (`/operator.html`)
2. Review daily briefing — act on every HIGH/CRITICAL alert
3. Send outreach to all HOT leads (pre-written by HUNTER, you personalize 1 line)
4. Follow up on active proposals (call or email, same day)
5. Check inbound captures from landing page

### Midday Block (30 min) — Delivery
6. Check active project status in CRM
7. Complete 1 delivery task (or delegate to AI with prompts in `/prompts/`)
8. Send client a progress update (template in `/templates/`)

### Evening Block (15 min) — Finance
9. Mark paid invoices in HUNTER OS
10. Chase overdue invoices (automated reminder already sent)
11. Review tomorrow's calendar

## Weekly Rhythm

| Day | Focus |
|-----|-------|
| Monday | Pipeline review, set weekly outreach targets, check n8n discovery results |
| Tuesday | Discovery calls (max 3) |
| Wednesday | Delivery day — deep work on active projects |
| Thursday | Proposal generation + follow-ups |
| Friday | Close deals, send invoices, weekly metrics review |

## Decision Rules (When the System Asks You)

| Situation | Action |
|-----------|--------|
| HOT lead (90+) | Outreach within 4 hours. Personalized first line required. |
| HIGH lead (75-89) | Outreach within 24 hours. Use Strategy B or D. |
| Reply received | Book 15-min diagnostic within 48 hours. |
| Diagnostic delivered | Follow up in 3 days with proposal offer. |
| Proposal sent | Follow up Day 3, Day 7, Day 14. Then move to nurture. |
| Deal closed | Convert in HUNTER OS → auto-creates client, project, deposit invoice. |
| Project complete | Deliver final invoice, pitch retainer same day. |

## What the System Handles (You Don't)

- LinkedIn company discovery (n8n daily 6 AM)
- Lead scoring (Gemini auto-score)
- Initial outreach drafts (6 strategy templates)
- 7-day follow-up reminders (cron)
- HOT lead Slack alerts
- Weekly pipeline reports
- Proposal first drafts (AI generator)
- Diagnostic report generation
- Invoice creation on deal close
- Duplicate lead filtering

## What Only You Do

- Discovery calls (15 min, use `/prompts/discovery-call.md`)
- Proposal review and send (AI drafts, you approve)
- Client relationships and trust
- Technical delivery (or AI-assisted with prompts)
- Closing conversations
- Strategic decisions

## Capacity Limits (Don't Exceed)

| Resource | Max |
|----------|-----|
| Active projects | 2 simultaneous |
| Discovery calls/week | 5 |
| Retainer clients | 5 |
| Outreach/day (manual review) | 10 |

Exceeding these degrades quality. Raise prices before adding capacity.

## Emergency Protocols

| Crisis | Response |
|--------|----------|
| No leads in pipeline | Trigger manual n8n run + post 3 LinkedIn pieces (prompt in `/prompts/linkedin-content.md`) |
| No revenue this month | Call every HIGH/HOT lead. Offer diagnostic to 5 new prospects. |
| Client unhappy | 24hr response. Scope fix at no charge if <4hrs. Document in project notes. |
| Overdue invoice >14 days | Personal call. Pause work if >30 days. |

## Monthly Review Checklist

- [ ] Revenue vs. target ($50K/mo minimum by Month 3)
- [ ] Win rate by strategy (double down on best performer)
- [ ] MRR growth (target: +1 retainer/month after Month 4)
- [ ] Pipeline coverage (3x monthly target in weighted pipeline)
- [ ] Service mix (which packages close most?)
- [ ] n8n discovery volume (target: 50+ new leads/month)
