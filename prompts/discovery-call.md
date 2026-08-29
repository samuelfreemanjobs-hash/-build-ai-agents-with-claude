# Discovery Call Script (15 Minutes)

## Pre-Call (2 min)
- Pull up lead in HUNTER CRM — review score, problems, diagnostic
- Have diagnostic report ready to screen-share if generated
- Goal: qualify fit, deliver value, book proposal — NOT close on this call

## Opening (2 min)
"Thanks for taking 15 minutes. I run HUNTER Intelligence — we help mid-market manufacturers eliminate operational friction. I did some research on {{company}} before this call. Mind if I share what I found?"

*[Share top friction point from diagnostic or score]*

## Discovery Questions (8 min)

Ask 3-4 of these based on their industry:

1. "Walk me through what happens when a new order comes in — from receipt to ship."
2. "Where do your teams spend the most time on manual data entry?"
3. "If I asked your plant manager for yesterday's OEE right now, how long would it take?"
4. "What's the one process that breaks every time volume spikes?"
5. "Have you looked at solving this before? What happened?"
6. "If we could fix [detected problem] in 3 weeks, what would that be worth to you?"

## Listen For
- Budget signals ("we've been looking at this" / "we have budget in Q3")
- Urgency signals (audit coming, new OEM contract, quality escape)
- Decision process (who else needs to sign off)
- Timeline (when do they need this solved)

## Close (3 min)
"Based on what you've shared, I think {{matched_service}} is the right fit. I'll put together a specific proposal with scope, timeline, and ROI projection — you'll have it within 48 hours. Does that work?"

If yes → update lead stage to "Proposal Active" in HUNTER OS
If maybe → deliver diagnostic report, follow up in 3 days
If no → ask "What would need to be true for this to be a priority?" — note and nurture

## Post-Call (5 min)
1. Update lead notes in HUNTER CRM
2. Generate proposal: `POST /api/proposals/generate`
3. Send calendar invite for proposal review call
4. Slack yourself a reminder to follow up in 48hrs
