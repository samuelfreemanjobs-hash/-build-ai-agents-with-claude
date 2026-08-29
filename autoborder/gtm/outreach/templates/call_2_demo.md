# Call 2 — Solution Architect Demo Script (60 minutes)
**Prospect:** {contact_name} — {company_name} ({city})

---

## Setup (5 min)

"Today I'll show you {company_name}'s supply chain the way CBP sees it — not the way Excel sees it.

We're going to walk through a live BOM graph, identify every non-originating component dragging down RVC, and show you the exact Forensic PDF your auditor would receive."

**Screen share:** Open `http://localhost:8000/demo` → Load part (prospect's part or #12345 sandbox)

---

## Graph Walkthrough (25 min)

### Show the graph
"Blue node is your finished part. Green is originating — US, Mexico, Canada. Red is non-originating. Amber is partial."

### Click risk path
"See this chain? Root → bearing assembly → Chinese steel balls. This is where your RVC bleeds.

Your internal team may count the bearing as partially originating. CBP's build-down method doesn't. That's a 2–4% RVC swing — enough to fail the 75% threshold."

### RVC panel
"Your calculated RVC: **[X]%**. Threshold: 75%. Status: **[COMPLIANT / NON-COMPLIANT]**."

### Node detail
"Every number links to an ERP transaction ID. When CBP asks 'where did this cost come from?' — you click, you show, you're done in 5 minutes."

---

## Tariff Leak Calculator (10 min)

"Let me show you the dollar impact."

**Screen share:** Open `/` → Upload sample BOM → Show overpayment number

"This is what your CFO cares about. Not RVC percentages — **dollars overpaid last quarter**."

---

## Design Partner Offer (15 min)

"{program_summary}

And we back it:

**{guarantee_clause}**

We'd map your top 100 parts — free. You sign an LoI only if our math beats yours."

---

## Close to Call 3

"For Call 3, I'd like to bring our trade attorney and walk your legal/procurement team through the Forensic PDF template and our $500K indemnity coverage.

Can we get 90 minutes with your CFO or Director of Customs Compliance?"

**Send after call:** Savings Report PDF + Design Partner Program one-pager + LoI draft
