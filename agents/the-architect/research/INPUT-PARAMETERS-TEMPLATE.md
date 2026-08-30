# Input Parameters Template

Turn-key brief normalization for The Architect. Copy, fill, paste before any task — or let the agent populate from conversation and flag assumptions.

**Protocol:** `ENTERPRISE-AI-OUTPUT-PROTOCOL.md`

---

## [INPUT PARAMETERS]

```
PRODUCT_NAME:
TARGET_AVATAR/DEMOGRAPHIC:
PRIMARY_PAIN_POINT:
PRICE_POINT_AND_TERMS:
STAGE_OF_AWARENESS:           # unaware | problem | solution | product | most
STAGE_OF_SOPHISTICATION:      # 1–5
PRIMARY_DELIVERABLE_REQUESTED:
CHANNEL / PLATFORM:
GOAL_METRIC:                  # Client attraction — opt-ins, CVR, calls, MRR, revenue
PROOF_AVAILABLE:              # stats, case studies, credentials, demos
COMPLIANCE_CONSTRAINTS:
COMPETITORS_TO_DIFFERENTIATE:
```

---

## Optional extensions

### B2B / ABM (when applicable)

```
NAMED_ACCOUNTS_OR_ICP:
BUYING_COMMITTEE_ROLES:       # champion, decision_maker, gatekeeper, procurement, end_user
ROI_MODEL_INPUTS:
SALES_CYCLE_LENGTH:
```

### Website design ($10K tier — when applicable)

```
SITE_ARCHETYPE:               # high_ticket | info_product | saas | personal_brand | ecommerce | funnel_hub
PAGES_IN_SCOPE:               # e.g. Home, About, Services, Case Studies, Book Call
PRIMARY_CONVERSION_ACTION:    # book_call | buy | apply | opt_in
PLATFORM / TECH STACK:        # Webflow, WordPress, Shopify, custom
EXISTING_BRAND_ASSETS:        # logo, colors, fonts — or build from scratch
```

**Template:** `research/WEBSITE-DESIGN-BUILD-TEMPLATE.md`

### SaaS / Subscription (when applicable)

```
MRR_ARR_TARGET:
CHURN_RATE_CURRENT:
ACTIVATION_MILESTONE:
FAILED_PAYMENT_RECOVERY_NEEDED:  # yes | no
```

### Funnel CRO (when metrics provided)

```
METRIC_SYMPTOM:               # e.g. "high clicks, low opt-in"
CURRENT_NUMBERS:              # paste table or CSV
FUNNEL_STAGE_BROKEN:
```

### Long-form / modular output

```
ESTIMATED_LENGTH:             # short | medium | long | multi-module
MODULE_PREFERENCE:            # auto | specify parts
```

---

## Assumption protocol

If any required field is blank:

1. State assumption in `<diagnostic_summary>` under **Labeled Assumptions**
2. Never assume price, compliance, or proof without flagging
3. Ask user to confirm only when wrong assumption would change strategy materially

---

Save completed template to: `agents/the-architect/projects/<slug>/input-parameters.md`
