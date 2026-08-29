# Email Sequence — Day 0: Initial Outreach

**Trigger:** Lead created or scored as HIGH/HOT
**Send via:** HUNTER Outreach Engine (Strategy A or B)

---

**Subject:** {{outreach_subject}}

{{outreach_body}}

---

*Personalize the first line before sending. Reference something specific about their company.*

---

# Email Sequence — Day 3: Value Add

**Trigger:** No reply after 3 days
**Condition:** Stage = "Outreach Sent"

**Subject:** Quick follow-up — {{company}}

Hi {{decision_maker}},

I sent a note earlier this week about operational efficiency at {{company}}.

One thing I didn't mention: manufacturers in {{industry}} typically lose $180K–$320K annually to the exact friction patterns I identified at your operation.

I put together a brief analysis — happy to share it, no strings attached.

Worth 15 minutes?

[Your Name]
HUNTER Intelligence

---

# Email Sequence — Day 7: Case Study

**Trigger:** No reply after 7 days
**Condition:** Stage = "Outreach Sent" or "Diagnostic Ready"

**Subject:** How a {{industry}} shop cut reporting time by 90%

Hi {{decision_maker}},

Quick story: a {{industry}} operation similar to {{company}} was spending 15 hours/week compiling production reports from 12 different spreadsheets.

We built them a live KPI dashboard in 3 weeks. Plant manager now pulls any metric in under 30 seconds.

If {{company}} has similar challenges, I can run a free diagnostic and show you exactly where the friction is.

15 minutes this week?

[Your Name]

---

# Email Sequence — Day 14: Breakup

**Trigger:** No reply after 14 days
**Condition:** Stage still in outreach/diagnostic

**Subject:** Closing the loop — {{company}}

Hi {{decision_maker}},

I've reached out a few times about operational intelligence for {{company}}. Totally understand if the timing isn't right.

I'll close your file for now. If things change — new OEM contract, quality audit, leadership transition — I'm here.

One click: reply "DIAGNOSTIC" and I'll run a free friction report, no call required.

Best,
[Your Name]

---

*After Day 14 breakup: move lead to nurture list. Re-engage in 90 days via n8n.*
