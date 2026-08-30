# Conversational AI & Voice Agent Methodology

**Real-time sales AI layer for The Architect.** Phone AI scripts, SMS chatbots, IVR flows, and conversational sales handling — optimized for belief and conversion in spoken/text dialogue.

**One voice.** Conversational, peer-to-peer; never robotic pitch mode.

**Paired:** `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md` · `CARLTON-METHODOLOGY.md` (bonding) · `COMPLIANCE-RISK-METHODOLOGY.md`

---

## Conversational AI in One Sentence

> **Design every turn like a sales conversation across the table — short turns, clear branches, objection nodes, and one inevitable next step.**

---

## Voice Agent Architecture (Retell / Bland / Vapi-style)

### Call flow topology

```
GREET → QUALIFY → DISCOVER → PITCH → HANDLE OBJECTION → CLOSE → FALLBACK
         ↓           ↓          ↓            ↓              ↓
      [voicemail] [nurture]  [send link]  [retry loop]   [book/transfer]
```

### Turn design rules

| Rule | Spec |
|---|---|
| **Turn length** | 1–3 sentences per agent speak |
| **One question** | Never stack questions |
| **Confirm** | Repeat back key info |
| **Barge-in** | Allow interruption on long monologues |
| **Silence** | 2–3 sec pause → gentle prompt |
| **Transfer** | Human handoff trigger words + warm intro |

### Sample voice script blocks

**Greet:**
> "Hey {{first_name}}, it's {{agent_name}} from {{company}} — you requested info about {{offer}}. Got 90 seconds?"

**Qualify:**
> "Quick one — are you currently {{pain situation}}, or mostly trying to {{desired outcome}}?"

**Objection — price:**
> "Totally fair. Most clients felt the same until they saw {{ROI metric}}. Want me to walk through how that math works for your situation?"

**Close:**
> "I've got {{day}} at {{time}} — does that work to lock this in?"

### Compliance (voice)

- Recorded line disclosure where required
- No guaranteed income/health outcomes
- Opt-out for SMS/calls honored immediately
- AI disclosure if jurisdiction requires

---

## SMS / Chatbot Conversational Flows

### SMS constraints

- 160 chars ideal per bubble; max 2 bubbles before response
- One CTA link per sequence turn
- STOP/HELP compliance

### Chatbot node types

| Node | Job |
|---|---|
| **Greeting** | Context + one qualifying question |
| **Branch** | IF answer A → path 1; B → path 2 |
| **Content** | Short proof or mechanism |
| **Objection** | Pre-written handlers |
| **CTA** | Book / buy / human handoff |
| **Fallback** | "Let me get a human for you" |

### Example SMS nurture (3-touch)

```
T1: {{first_name}}, saw you grabbed {{lead_magnet}}. What's the #1 thing you're trying to fix this month? Reply A/B/C
T2: [Based on reply] — here's the 2-min case study: {{link}}
T3: Spots open {{day}} for a quick strategy call — want the link?
```

---

## IVR Routing Sequences

```
"Press 1 for sales, 2 for support, 3 for billing"
→ Sales: qualify → route to tier (enterprise / SMB)
→ Support: ticket creation script
→ After hours: voicemail + SMS follow-up promise
```

---

## Deliverable package

1. **Flow diagram** — nodes + branches
2. **Script library** — every node verbatim
3. **Objection matrix** — trigger phrase → response
4. **Handoff rules** — when human takes over
5. **Compliance notes** — disclosures, opt-out
6. **System prompt** (for LLM voice) — persona, constraints, tools

**Output tag:** `<voice_agent_script>` · `<chatbot_flow>`

---

See also: `AGENT-BUILDER-METHODOLOGY.md` · `MARKETING-AUTOMATION-PERSONALIZATION-METHODOLOGY.md`
