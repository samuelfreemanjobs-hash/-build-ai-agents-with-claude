# Marketing Automation & Personalization Methodology

**Technical automation layer for The Architect.** Dynamic CRM copy blocks, conditional logic, and platform-native merge tags for Klaviyo, ActiveCampaign, HubSpot, and similar systems.

**One voice.** Personalization feels human; logic stays invisible.

**Template:** `research/CRM-PERSONALIZATION-BLOCK-TEMPLATE.md`  
**Paired:** `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md` · `LIST-BUILDING-METHODOLOGY.md`

---

## Personalization in One Sentence

> **Write once, branch intelligently — every segment sees copy that sounds like you wrote it only for them.**

---

## Dynamic Copy Block Architecture

### Conditional logic pattern

```
IF [condition] THEN [copy block A] ELSE [copy block B]
```

### Common segmentation dimensions

| Dimension | Example conditions | Copy impact |
|---|---|---|
| **Lead score** | Hot ≥ 80 vs cold < 40 | Urgency vs nurture |
| **Purchase history** | Buyer vs non-buyer | Ascension vs first purchase |
| **Industry** | SaaS vs agency vs ecom | Case study + jargon match |
| **Awareness** | Problem vs solution aware | Agitation depth |
| **Engagement** | Opened last 3 vs dormant | Re-permission vs offer |
| **Cart** | Abandoned vs purchased | Recovery vs thank-you |
| **Geography** | US vs EU vs APAC | Localization + compliance |

---

## Platform Merge Tag Reference

### Klaviyo

```
{{ first_name|default:"there" }}
{% if person|lookup:'Lead Score' > 80 %}
  [Hot lead copy block]
{% else %}
  [Nurture copy block]
{% endif %}
{{ event.extra.checkout_url }}
```

### ActiveCampaign

```
%FIRSTNAME%
%IFLEADSCORE>80%[Hot block]%/IF%
%ELSE%[Nurture block]%/ELSE%
```

### HubSpot

```
{{ contact.firstname }}
{% if contact.lead_score > 80 %}
  [Hot block]
{% endif %}
{{ custom.cart_url }}
```

**Rule:** Document exact field names from client's CRM — never guess property slugs.

---

## Dynamic Block Deliverable Spec

For each automated email/flow, deliver:

| Column | Content |
|---|---|
| **Flow name** | Welcome / cart abandon / post-purchase |
| **Trigger** | Event + conditions |
| **Segment** | Who receives |
| **Subject variants** | By segment if needed |
| **Body blocks** | Static + conditional blocks labeled |
| **Merge tags** | Platform-specific syntax |
| **Fallback copy** | When field empty |
| **CTA URLs** | Dynamic product/cart links |

### Example: post-purchase ascension

```
IF product = "Course A" AND days_since_purchase > 7 AND upsell_not_purchased
THEN send "Coaching application" block
ELSE IF product = "Course A"
THEN send "Module 2 homework" block
```

---

## Automation Flow Types (copy specs)

| Flow | Touches | Primary job |
|---|---|---|
| **Welcome** | 5–7 | Belief + first win + soft CTA |
| **Cart abandon** | 3–4 | Objection + guarantee + urgency |
| **Browse abandon** | 2–3 | Reminder + social proof |
| **Post-purchase** | 3–5 | Onboard + ascension + review ask |
| **Win-back** | 3 | Re-permission + offer |
| **Lead nurture** | 7–14 | Soap opera + mechanism + offer |
| **Event** | 5–8 | Registration → reminders → replay |

---

## Ship Gate

- [ ] All merge tags validated against platform syntax
- [ ] Fallbacks for empty fields
- [ ] Conditional blocks tested (both branches read well)
- [ ] Compliance disclaimers in applicable flows
- [ ] One primary CTA per email

---

See also: `EVENT-LAUNCH-ARCHITECTURE-METHODOLOGY.md` · `SAAS-RETENTION-CRO-METHODOLOGY.md`
