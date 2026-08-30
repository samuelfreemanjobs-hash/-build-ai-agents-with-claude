# CRM Personalization Block Template

**Methodology:** `MARKETING-AUTOMATION-PERSONALIZATION-METHODOLOGY.md`

---

## Flow

| Field | Value |
|---|---|
| **Platform** | Klaviyo / ActiveCampaign / HubSpot |
| **Flow name** | |
| **Trigger** | |

---

## Segments & conditions

| Segment | Condition | Copy block ID |
|---|---|---|
| Hot | lead_score > 80 | BLOCK-A |
| Nurture | lead_score ≤ 80 | BLOCK-B |

---

## Email body (with conditional blocks)

```
{% if condition %}
BLOCK-A copy here
{% else %}
BLOCK-B copy here
{% endif %}
```

---

## Merge tag map

| Field | Platform syntax | Fallback |
|---|---|---|
| First name | | "there" |

---

Save to: `agents/the-architect/projects/<slug>/automation/flow-spec.md`
