# HUNTER Intelligence — 30-Day Launch Checklist

## Week 1: Foundation (Days 1–7)

### Day 1: Infrastructure
- [ ] Create Supabase project
- [ ] Run `supabase/migration.sql` + `migration-v2-business.sql`
- [ ] Deploy backend to Railway/Render
- [ ] Set all env vars (Supabase, Gemini, Resend, Slack)
- [ ] Verify `/api/health` returns all services green

### Day 2: Domain & Email
- [ ] Register domain (e.g., hunterintel.com)
- [ ] Set up Resend with verified domain
- [ ] Update `RESEND_FROM` to `you@hunterintel.com`
- [ ] Deploy landing page (`frontend/index.html`)
- [ ] Test `/api/capture` form submission

### Day 3: Automation
- [ ] Import `n8n/hunter-lead-discovery.json`
- [ ] Import `n8n/hunter-follow-up-sequence.json`
- [ ] Configure Apify token + HUNTER API URL in n8n
- [ ] Run manual test — verify leads appear in CRM
- [ ] Connect Slack webhook — verify HOT alerts

### Day 4: CRM & Operator Setup
- [ ] Open `frontend/hunter_crm.html` — verify pipeline works
- [ ] Open `frontend/operator.html` — verify daily briefing loads
- [ ] Test AI Scorer with 3 real companies
- [ ] Test proposal generation on 1 lead
- [ ] Test diagnostic generation on 1 lead

### Day 5: Content & Positioning
- [ ] Customize landing page with your name/brand
- [ ] Write 3 LinkedIn posts using `/prompts/linkedin-content.md`
- [ ] Set up Calendly (or Cal.com) for 15-min diagnostic calls
- [ ] Add booking link to outreach templates

### Day 6: Outreach Prep
- [ ] Review first batch of n8n-discovered leads
- [ ] Send outreach to top 10 HOT/HIGH leads
- [ ] Generate diagnostics for top 3 prospects
- [ ] Prepare 2 proposals for warm prospects

### Day 7: Review & Adjust
- [ ] Review Week 1 metrics in Operator Dashboard
- [ ] Adjust n8n search industries/locations if needed
- [ ] Fix any broken automations
- [ ] Plan Week 2 discovery calls

## Week 2: First Revenue (Days 8–14)

### Day 8–10: Sell
- [ ] 3 discovery calls (use discovery-call prompt)
- [ ] Deliver 3 diagnostics within 48hrs of each call
- [ ] Send 2 proposals
- [ ] Follow up all Week 1 outreach (Day 7 follow-up)

### Day 11–12: Deliver (if deal closed)
- [ ] Convert lead in HUNTER OS
- [ ] Send deposit invoice
- [ ] Kickoff call with client
- [ ] Begin delivery using service SOP prompts

### Day 13–14: Pipeline Build
- [ ] Post 3 more LinkedIn articles
- [ ] Review n8n discovery results
- [ ] Score and outreach 15 new leads
- [ ] Target: 1 proposal active, 3 diagnostics delivered

## Week 3: Systemize (Days 15–21)

- [ ] Close first deal (target: $18K–$24K)
- [ ] Collect deposit
- [ ] Deliver project Week 1 milestones
- [ ] Add 1 retainer pitch to proposal follow-ups
- [ ] Optimize best-performing outreach strategy
- [ ] Review win rate by industry — focus n8n on winners

## Week 4: Scale (Days 22–30)

- [ ] Revenue target: $25K+ collected
- [ ] 2+ active proposals in pipeline
- [ ] 1 project in delivery
- [ ] 50+ leads in CRM
- [ ] MRR target: pitch retainer to every closed client
- [ ] Review full month metrics
- [ ] Plan Month 2: double outreach volume

## Launch Day Minimum Viable

If you need to launch TODAY with the minimum:

1. `npm install && cp .env.example .env` (fill keys)
2. Run both Supabase migrations
3. `npm start`
4. Deploy landing page
5. Import n8n lead discovery workflow
6. Send outreach to 5 companies manually via CRM
7. Book first diagnostic call

**Everything else builds on this.**

## Success Criteria (Day 30)

| Metric | Target |
|--------|--------|
| Leads in CRM | 50+ |
| Outreach sent | 100+ |
| Diagnostics delivered | 10+ |
| Proposals sent | 5+ |
| Deals closed | 1–2 |
| Revenue collected | $25,000+ |
| Retainer conversations | 3+ |
