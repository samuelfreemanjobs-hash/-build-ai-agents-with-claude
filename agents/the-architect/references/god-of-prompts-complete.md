# 🔑 God of Prompts — Complete Prompt Engineering System

> Extracted from 13 emails sent by Robert & Alex at God of Prompt (godofprompt@mail.beehiiv.com).
> Every framework, prompt, chain system, and rule — all in one place.

---

## THE 12 CORE PRINCIPLES

**01 — Systems over single prompts**
Chain prompts where output A feeds input B. Never rely on one prompt for complex work. The result compounds.

**02 — Rich persona, not a job title**
Never say "You're a marketing consultant." Give a backstory, obsession, and contradiction. The AI writes from the character.

> Weak: "You're a marketing consultant."
> Strong: "You're a reformed Wall Street trader who burned out at 32, discovered permaculture, and now helps regenerative brands tell stories that actually heal the planet instead of just virtue-signaling."

**03 — XML zoning laws**
Use `<constraints>`, `<document>`, `<variables>` to separate instructions from content. Claude processes XML natively — this is the single biggest output quality upgrade.

**04 — Theory of Mind**
Treat the AI as a brilliant alien intern. It has zero context about your life. Bridge every gap explicitly. The MIT study confirms: +29% better outputs from perspective-taking.

**05 — Built-in self-critique**
Never send a first draft. Always loop: Generate → Critique → Refine. The AI must judge its own output before you do.

**06 — Meta-prompting**
Stop writing prompts — build machines that write them. A prompt generator produces better prompts faster than manual engineering.

**07 — Context architecture first**
Invest 2 hours building context files (about-me, brand-voice, working-preferences). Then every session starts smart with a 10-word prompt.

**08 — The 60% Rule (research-backed)**
Cap reasoning at 60% of the model's natural output length → 97% accuracy maintained. Longer output = lower confidence, not higher thoroughness. (Source: Nanjing University, 32 reasoning budgets tested.)

**09 — State compaction**
In long sessions, compress state every 10–15 messages. Force the AI to summarize into a JSON "save point" so it never loses the original goal.

**10 — End-session memory**
Before closing any important chat, run the memory summary prompt. Paste it at the top of the next session. Your AI picks up exactly where it left off.

**11 — Three-layer prompts**
Layer 1: who you are. Layer 2: what this session is about. Layer 3: the specific task right now. Never one long messy block.

**12 — Match token budget to task difficulty**
Easy questions need short, tight prompts with word limits. Hard questions get slightly more room. Never uniform across both. Simple questions hit the overthinking zone at just 2,000 tokens.

---

## THE RECONSIDERATION RED FLAGS

If you see any of these phrases appearing **late** in a response, accuracy has already peaked. Regenerate with a tighter prompt:

- "Actually…"
- "Let me reconsider…"
- "I may have overcounted…"
- "Wait, on reflection…"

These are not signs of thoroughness. They are signs the model is losing confidence and spiralling. The correct answer was already there.

---

## PROMPT FRAMEWORKS

### 1. The #CONTEXT Framework (Standard — All AI Tools)

```
#CONTEXT:
Adopt the role of [ROLE]. Your task is to help the user: [TASK].
You are working with [AUDIENCE].

#ROLE:
You are [RICH PERSONA WITH BACKSTORY]. You have deep expertise,
a direct communication style, and zero tolerance for filler.
You see the patterns others miss and state them plainly.

#RESPONSE GUIDELINES:
1. Begin by clarifying the core objective in one sentence.
2. Provide your main analysis or output.
3. End with one concrete next action or recommendation.
4. No filler, no preamble, no "certainly."

#[TASK] CRITERIA:
- [KEY CONSTRAINT].
- Do NOT invent facts or assume unstated context.
- Ask one clarifying question if input is ambiguous before proceeding.
- Focus exclusively on [TASK].

#INFORMATION ABOUT ME:
- My [Variable #1]: [VALUE]
- My [Variable #2]: [VALUE]
- My [Variable #3]: [VALUE]

#RESPONSE FORMAT:
[Markdown / Bullet points / Table / JSON / Step-by-step]

Take a deep breath and work on this problem step-by-step.
```

---

### 2. XML-Optimized Structure (Claude)

Claude processes XML natively. Use this for maximum precision and control.

```
<context>
  Adopt the role of [ROLE]. Primary objective: [GOAL].
  You are serving [AUDIENCE].
</context>

<role>
  You are [RICH PERSONA]. Direct, precise, focused on what actually
  moves the needle. You eliminate fluff before it appears.
</role>

Your task is to analyze the following:

<document>
  [PASTE YOUR CONTENT HERE]
</document>

<instructions>
  1. Analyze the input carefully.
  2. Execute: [GOAL].
  3. Validate output against constraints before responding.
</instructions>

<constraints>
  [KEY CONSTRAINT].
  Do NOT invent information not present in the input.
  Command voice only — no "please" or "I would like."
</constraints>

<variables>
  audience: [VALUE]
  goal: [VALUE]
  user_input: [VALUE]
</variables>
```

---

### 3. Three-Layer Prompt Structure (Memory Fix)

Replaces any long messy prompt instantly. From "Your AI Keeps Forgetting You."

```
Layer 1 — Who I am and the context you need:
[Your identity: role, audience, goals, tone, tools, preferences]

Layer 2 — What this session is about:
[The specific project or task type for today]

Layer 3 — The exact task I need right now:
[One clear, specific request with desired output format]
```

---

### 4. XML Conversion Prompt (Upgrade Any Existing Prompt)

Feed any existing prompt into this to get a cleaner, Claude-native version.

```
<instructions>
Convert the prompt below so it works better with Claude.
Increase clarity. Use XML tags wherever they help separate
the instruction from the content. Keep the tone direct.
</instructions>

<prompt>
[PASTE YOUR EXISTING PROMPT HERE]
</prompt>
```

---

### 5. Google TCREI Scaffold

Forces complete context before any execution.

**T** — Task (exact action)
**C** — Context (background)
**R** — References (examples)
**E** — Evaluate (success criteria)
**I** — Iterate (refinement method)

Use Prompt #1 to scaffold the full brief → Prompt #2 to refine using 4 iteration methods: framework revisit, shorter sentences, different phrasing, added constraints.

---

## PROMPT GENERATORS (Meta-Prompting)

Build machines that write prompts. Feed a rough task description → get a professional prompt.

| Generator | Best For | Platform |
|---|---|---|
| #1 Structured | Quick, focused tasks | All AI tools |
| #2 Multi-phase | Complex systems (3–15 phases) | ChatGPT, Claude |
| #3 XML Builder | Maximum precision | Claude only |

**How to use:** Replace `[===INSERT TASK===]` with any rough task description. The generator asks questions, applies frameworks, and outputs a ready-to-use prompt. Output takes 2 minutes vs. 30 minutes manually.

---

## CHAIN SYSTEMS

### Chain 1 — Self-Critique Quality Control

> From "Prompt Engineering Isn't Dead." Never ship a first draft.

**Step 1 → Draft Generator**

```
#CONTEXT:
You are an expert marketing copywriter. Your task is to help me
draft a piece of content based on my requirements.

#ROLE:
You are a creative and persuasive copywriter. Generate a first
draft that is engaging and clear.

#RESPONSE GUIDELINES:
- Write in concise, engaging prose.
- Don't use complicated or fancy words.
- Focus on the core message and call to action.

#INFORMATION ABOUT ME:
- My Content Request: [e.g., 100-word email about a flash sale]
- My Product: [INSERT]
- My Target Audience: [INSERT]
- My Call to Action: [INSERT]

#RESPONSE FORMAT:
[Full text of the generated content]
```

**Step 2 → Self-Criticism Engine**

```
#CONTEXT:
You are an expert content critic and editor.

#ROLE:
You are a harsh, brutally honest editor. Your job is not to be
nice — it is to find every flaw that makes the content weak,
unpersuasive, or boring.

#TASK CRITERIA:
- Critique must be specific (not "the hook is weak" —
  "the subject line is generic and doesn't create urgency").
- Identify at least 5-7 distinct flaws.
- For each flaw, explain why it's a problem.

#INFORMATION ABOUT ME:
- [PASTE OUTPUT FROM PROMPT 1 HERE]

#RESPONSE FORMAT:
Brutal Critique:
- Flaw 1: [Description + why it's bad]
- Flaw 2: [Description + why it's bad]
```

**Step 3 → Final Polish Generator**

```
#CONTEXT:
You are an elite copywriter. Take a flawed draft and a list
of criticisms and synthesize them into a polished final version.

#TASK CRITERIA:
- Rewrite the draft from scratch.
- Integrate ALL feedback — address every single point.
- The final output should be persuasive, professional, ready to send.

#INFORMATION ABOUT ME:
- Draft: [PASTE OUTPUT FROM PROMPT 1]
- Critique: [PASTE OUTPUT FROM PROMPT 2]

#RESPONSE FORMAT:
[The final, polished, rewritten content]
```

---

### Chain 2 — XML Constraint System (Stop Hallucinations)

> From "Your ChatGPT Can't Focus." Hardens loose prompts into enterprise-grade directives.

**Step 1 → Logic Auditor**

```
#CONTEXT:
You are a Senior AI Reliability Engineer specializing in
Failure Mode Analysis for Large Language Models.

#ROLE:
Adopt the role of "The Pessimistic Auditor." Find every possible
way a user's prompt could be misinterpreted, lead to hallucinations,
or produce excessive verbosity.

#RESPONSE GUIDELINES:
1. Analyze the user's [Input Prompt].
2. Search for these Failure Modes:
   - Verbosity Leak: Is the length undefined?
   - Scope Creep: Are negative constraints missing?
   - Hallucination Trigger: Is the data source vague?
3. Do not be polite. Be precise.

#TASK CRITERIA:
- Output a "Risk Matrix" table.
- Identify which specific XML control blocks are missing.

#INFORMATION ABOUT ME:
- My Input Prompt: [INSERT YOUR CURRENT PROMPT HERE]

#RESPONSE FORMAT:
🚨 RISK MATRIX
| Failure Mode | Probability | Consequence | Recommended Fix |
|---|---|---|---|

🛠️ REQUIRED UPGRADES:
- [List the specific XML tags needed]
```

**Step 2 → XML Architect**

```
#CONTEXT:
You are an expert Prompt Engineer. You write "System Directives"
using XML scaffolding. Ambiguity is the enemy of automation.

#ROLE:
"The XML Architect." Rewrite the user's prompt into a strict,
machine-readable format that eliminates all "wiggle room."

#RESPONSE GUIDELINES:
1. Ingest the [Original Prompt] and [Audit Risks].
2. Rewrite using MANDATORY blocks:
   - <output_format>: Define strict sentence/bullet counts.
   - <boundaries>: Use phrase "Do NOT invent..."
   - <clarification_rules>: Define when to ask vs. assume.
3. Remove all conversational fluff (no "Please," "I would like").

#INFORMATION ABOUT ME:
- Original Prompt: [INSERT ORIGINAL PROMPT]
- Risk Analysis: [INSERT OUTPUT FROM PROMPT 1]

#RESPONSE FORMAT:
[COMPLETE SYSTEM PROMPT WITH XML TAGS — copy-paste ready]
```

**Step 3 → State Compactor** (use every 10–15 messages)

```
#CONTEXT:
We are in a complex, multi-turn workflow. The context window
is filling with noise. Compress the state.

#ROLE:
"The Compression Algorithm." Discard historical noise and
retain only the "Active State" data.

#RESPONSE GUIDELINES:
1. Read the entire [Conversation History].
2. Generate a "Compacted State Object" containing ONLY:
   - The User's original Goal (immutable).
   - Constraints currently active.
   - Milestones completed (facts, not narrative).
   - The immediate Next Step.
3. Discard all chit-chat and intermediate reasoning.

#INFORMATION ABOUT ME:
- Conversation History: [PASTE FULL CONVERSATION]

#RESPONSE FORMAT:
```json
{
  "original_goal": "...",
  "active_constraints": ["...", "..."],
  "completed_milestones": [
    {"step": 1, "result": "..."}
  ],
  "next_action_required": "..."
}
```
```

---

### Chain 3 — Cognitive Empathy (Theory of Mind)

> From "Your Prompts Are Broken." MIT-backed: +29% better outputs.

**Step 1 → Epistemic Architect**

```
You are an Epistemic Breakthrough Architect. Conduct a Socratic
interrogation of the user's business concept to expose the
difference between "what they think they know" and "what is
actually true."

1. Ingest the user's concept.
2. Apply First Principles thinking. Strip away conventional wisdom.
3. Ask 3-4 hard questions about "blind spots." Focus on:
   - Source of knowledge (How do you know this?)
   - Hidden premises (What are you assuming is constant?)
   - Counterfactuals (What if the opposite were true?)
4. Output a "Hidden Assumptions vs. Actual Reality" summary.

Do not be polite. Be direct.

[INSERT YOUR BUSINESS CONCEPT OR PROBLEM HERE]
```

**Step 2 → Alien Collaborator**

```
# CONTEXT
We deconstructed a business concept and exposed hidden assumptions.
Now translate this into a strategy an "Alien Intelligence" can
execute perfectly without human bias.

# ROLE
You are a Xenolinguist Strategist. Take raw human intent, filter
it through the Reality Check, turn it into a concrete execution plan.

# RESPONSE GUIDELINES
1. Analyze the gap between the original idea vs. the Reality Check.
2. Identify Friction: where a standard AI would have failed.
3. Draft the strategy, flagging every "best guess" section.
4. End with one specific question about the biggest remaining ambiguity.

# TASK CRITERIA
- Input: The Reality Check output from Step 1.
- Format:
  - The Trap: (where we almost failed)
  - The Pivot: (how we fixed it)
  - The Execution: (the actual content/strategy)
  - The Blind Spot: (the question you must answer)

# INPUT
[PASTE THE REALITY CHECK FROM STEP 1 HERE]
```

**Step 3 → Theory of Mind Simulator**

```
# ROLE
You are the Target Audience Simulator.

# TASK
Take the content/strategy from Step 2.
Adopt the persona of the end-user (defined in the Reality Check).
Read the content. React to it in real-time.

# OUTPUT FORMAT
- The Gut Reaction: (immediate emotional response)
- The Friction Point: (where you stopped reading or got confused)
- The Verdict: (Did you buy/click/act? Why or why not?)

# CONSTRAINT
Do not be nice. Be tired, busy, and skeptical.
Use the Reality Check context to fuel your skepticism.

# INPUT
[PASTE THE EXECUTION PLAN FROM STEP 2]
```

---

### Chain 4 — Strategic Warfare (Competitive Intelligence)

> From "Crush Your Competitors." First Principles → Systems → Game Theory.

**Step 1 → DNA Deconstructor**

```
#CONTEXT:
Adopt the role of a Strategic Warfare Analyst and First Principles
Expert. Deconstruct a competitor's business model by ignoring
industry narratives and focusing on the fundamental physics of
how they actually operate.

#ROLE:
You are a former competitive intelligence specialist who spent years
reverse-engineering billion-dollar companies. You care about foundational
elements, not marketing narratives.

#RESPONSE GUIDELINES:
1. Use First Principles to break down the competitor's model.
2. Identify "Unspoken Assumptions" the competitor is making.
3. Use a skeptical, analytical tone. Avoid all corporate-speak.

#INFORMATION ABOUT ME:
- Industry/Market: [INSERT INDUSTRY]
- Key Competitors: [INSERT NAMES]
- Competitive Concerns: [INSERT SPECIFIC THREATS]

#RESPONSE FORMAT:
## FOUNDATIONAL PHYSICS: [INDUSTRY NAME]
[Base requirements for survival in this field]

## COMPETITOR DNA: [COMPETITOR NAME]
- Core Unit of Value: [what they actually sell vs. what they say]
- Resource Dependencies: [inputs they can't live without]
- Hidden Assumptions: [what they're betting on that might not be true]
```

**Step 2 → Feedback Loop Finder**

```
You are a Systems Thinking Architect. You view businesses as
interconnected machines. Identify where a small change in one
area causes a massive collapse in another.

- Focus on the "Interconnectedness" of elements from the DNA breakdown.
- Identify "Reinforcing Loops" (what makes them grow) and
  "Balancing Loops" (what holds them back).
- How does their scaling create new vulnerabilities?

- DNA Breakdown from Step 1: [PASTE OUTPUT FROM STEP 1]
- Strategic Timeframe: [INSERT TIMEFRAME]

Output:
- How the competitor's machine actually works
- The engines driving their current success
- Where the system is likely to overheat or break under pressure
- The one component that, if removed, collapses the entire system
```

**Step 3 → War Room Simulator**

```
#CONTEXT:
Adopt the role of a Game Theory Strategist. Predict the
competitor's future moves based on their structural physics and systems.

#ROLE:
You are a former casino card counter turned corporate strategist.
You see business as a game of probabilities and incentives.
You don't listen to CEO interviews — you look at where they
are forced to move based on structural incentives.

#RESPONSE GUIDELINES:
1. Use Game Theory to identify the Nash Equilibrium.
2. Predict "irrational" moves that are actually rational given their constraints.
3. Provide a Step-by-Step "Counter-Strike" plan.
4. Use emojis to number the steps.

#INFORMATION ABOUT ME:
- Systems Analysis from Step 2: [PASTE OUTPUT FROM STEP 2]
- My Current Business Model: [DESCRIBE YOUR MODEL]

#RESPONSE FORMAT:
## ♟️ THE STRATEGIC BATTLEFIELD
[Analysis of the current competitive standoff]

## 🔮 PREDICTED RIVAL MOVES
- Move 1: [Description and timing]
- Move 2: [Description and timing]

## ⚔️ THE COUNTER-STRIKE PLAN
1. 🛡️ [Protect your position]
2. ⚡ [Exploit their vulnerability]
3. 🏁 [Secure the market gap]
```

---

### Chain 5 — AI Memory System

> From "Your AI Keeps Forgetting You."

**Prompt 1 — Build Your AI Identity File**

```
I need you to help me build a personal identity file I can
use at the start of every AI session.

Ask me questions one at a time about:
- Who I am and what I do
- Who my audience is
- My current goals and projects
- My tone and communication style
- Things I never want you to do or say
- Tools and platforms I use

After each answer, ask the next question. Once you have
everything, write it up as a clean one-page brief I can
paste into any new chat.

Start with the first question now.
```

**Prompt 2 — Fix Any Prompt That Isn't Working**

```
I'm going to give you a prompt I've been using that isn't
giving me great results. Restructure it into three clear layers:

Layer 1 — Who I am and the context you need
Layer 2 — What this specific session is about
Layer 3 — The exact task I need you to do right now

Keep everything in plain language. Don't add anything I
didn't tell you. Just reorganize what's there so it's
clear and layered.

Here's my prompt: [PASTE YOUR PROMPT HERE]
```

**Prompt 3 — End of Session Memory Summary**

```
Before we finish this session, write me a short memory
summary I can use to start our next chat.

Include:
- What we were working on
- Key decisions we made
- The direction we're heading
- Any open questions or next steps
- Anything important I told you about myself or my business

Keep it short. No more than half a page. I'm going to paste
this at the top of our next conversation so you pick up
exactly where we left off.
```

---

### Chain 6 — Eisenhower Auditor (Productivity)

> From "Your Calendar Is Lying to You."

**Three ways to deploy:** (A) Connect Google Calendar via MCP and say "read my calendar for this week," (B) Upload a CSV export from your task manager, or (C) Manually list everything you did yesterday.

```
Adopt the role of a strategic priority analyst who uses the
Eisenhower Matrix to audit solopreneur schedules. You treat
every task as a choice the user made, not an obligation.
Your job: categorize their task load, expose how time splits
across quadrants, and restructure their schedule so minimum
40% of active hours go to Quadrant 2.

## PHASE 1: Task Ingestion
Accept tasks from: connected calendar, uploaded file, or manual list.
Before proceeding, ask: "What does a successful week look like
for your business in one sentence?"
This answer becomes your filter for what qualifies as Important.

## PHASE 2: Quadrant Classification
- Q1 Urgent + Important: Real deadlines, client deliverables, revenue-critical work
- Q2 Important + Not Urgent: Systems building, strategy, skill development
- Q3 Urgent + Not Important: Most emails, Slack, other people's priorities
- Q4 Not Urgent + Not Important: Passive scrolling, busywork, low-value admin

Key distinction: "revenue-generating work" vs. "revenue-adjacent busywork."
Checking analytics ≠ acting on analytics.

## PHASE 3: Pattern Analysis
TIME SPLIT: Q1: X% | Q2: X% | Q3: X% | Q4: X%
One-sentence verdict on what this split reveals.

PREVENTABLE FIRES: Identify any Q1 tasks that are only urgent
because the user procrastinated when they were Q2.

Q3 DIAGNOSIS: For every Q3 task, assign: Automate / Delegate / Batch / Eliminate.
Q4 DIRECTIVE: Eliminate or set a hard 20-minute daily cap.

## PHASE 4: Schedule Restructuring
1. PROTECTED Q2 BLOCKS — top 3 Q2 activities with recurring morning time blocks.
2. RESTRUCTURED DAILY SCHEDULE — hour-by-hour, minimum 40% Q2.
3. Q3 COMPRESSION PLAN — compress all Q3 into 1-2 batched windows per day.

Final output: One-paragraph summary of the single biggest change.
```

---

## THE 10-PROMPT SALES ARSENAL

> From "My 24/7 AI Sales Coach."

**Prompt 1 — Cold DM Opener**
```
You are a world-class salesperson who writes concise, personalized
cold messages that get 30%+ reply rates. Write a 3-4 line cold DM
to [Prospect Name] at [Company]. They recently [specific trigger:
posted about X, raised funding, hired for Y]. My product: [1-sentence
description]. Make it curious, non-salesy, and end with a soft question.
```

**Prompt 2 — Value Proposition Tailor**
```
You are a top-tier sales consultant. Rewrite my core value prop
for [Prospect Name] at [Company]. Their biggest pain is [pain 1],
[pain 2]. My solution delivers [benefit 1], [benefit 2], [benefit 3].
Make it 2-3 sentences, benefit-focused, no fluff.
```

**Prompt 3 — "Too Expensive" Handler**
```
Role-play as the prospect who just said "This seems really expensive."
Then write my response as a confident closer. Acknowledge the concern,
reframe with ROI using these numbers: [your pricing + customer results].
End with a question that moves the conversation forward.
```

**Prompt 4 — "Need to Think About It" Handler**
```
Prospect just said "I need to think about it." Write 3 possible replies:
One that creates gentle urgency. One that uncovers the real objection.
One assumptive close. Keep each under 4 lines and natural.
```

**Prompt 5 — "Need to Talk to My Boss" Handler**
```
Prospect says they need to run it by their [partner/boss/team].
Write a response that: Offers to help them sell it internally.
Provides social proof. Suggests next steps (forwardable summary
or joint call). Make it collaborative, not pushy.
```

**Prompt 6 — No-Response Follow-Up Sequence**
```
Create a 4-message follow-up sequence for a prospect who went dark
after a strong demo. Spacing: Day 3, Day 7, Day 14, Day 21.
Each message adds new value (case study, insight, question).
Tone: helpful, low-pressure, curious.
```

**Prompt 7 — Discovery Questions (BANT)**
```
Generate 8 powerful discovery questions for a [industry] prospect
who [specific situation]. Questions should uncover budget, authority,
need, timeline (BANT) naturally. Include 2 "implication" questions
that amplify pain.
```

**Prompt 8 — Assumptive Close Script**
```
Write a smooth assumptive close for the end of a call. We've covered
[features discussed], they showed interest in [specific points].
Options: [your packages/pricing]. Make it conversational and
include fallback if they hesitate.
```

**Prompt 9 — "Just Send Me Info" Deflector**
```
Prospect says "Can you just send me some info?" Write a reply that:
Politely pushes back. Books a 15-min call instead. Offers a
personalized case study relevant to their company.
Keep it short and confident.
```

**Prompt 10 — Negotiation Playbook**
```
Role-play a negotiation where they ask for [specific discount/custom terms].
Give me 3 strong responses using anchoring, trading value,
and walking-away power.
```

---

## 7 DECISION INTELLIGENCE FRAMEWORKS

> From "Claude Has A Secret Mode." Each is a complete, copy-paste prompt.

### Framework 1 — First Principles (Elon Musk's Method)
```
I'm dealing with a problem and I want you to help me think through
it using First Principles Thinking. Don't give me advice based on
convention or what's normally done. Instead, break my problem down
to its most fundamental truths — the things that are undeniably true
— and help me rebuild a solution from there. At each step, challenge
my assumptions. If I'm taking something for granted, call it out and
ask me to prove it's actually true.

My problem: [DESCRIBE YOUR PROBLEM IN DETAIL]
```

### Framework 2 — Inversion (Charlie Munger's Method)
```
I want you to help me solve a problem using Inversion, the mental
model popularized by Charlie Munger. Instead of asking "How do I
succeed at this?", start by asking "How would I guarantee failure
at this?" List every way this could fail, every bad decision I
could make, and every assumption that would destroy the outcome.
Then flip each one into a concrete action I should take.

My goal: [DESCRIBE WHAT YOU'RE TRYING TO ACHIEVE]
```

### Framework 3 — 5 Whys (Toyota Production System)
```
I have a recurring problem and I need to find the actual root cause,
not just the surface symptom. Use the 5 Whys method from the Toyota
Production System. Start with the problem I describe. Ask "Why does
this happen?" Take my answer and ask "Why?" again. Repeat at least
5 times until we hit something structural I can actually fix. Don't
accept vague answers. Push me to be specific at every level.

My recurring problem: [DESCRIBE THE PROBLEM YOU KEEP RUNNING INTO]
```

### Framework 4 — Second-Order Thinking (Howard Marks)
```
I'm about to make a decision and I want you to help me think through
it using Second-Order Thinking, as described by Howard Marks. Map out
the consequences in three layers:
→ First order: What happens immediately?
→ Second order: What does that cause to happen next?
→ Third order: What does THAT cause 6-12 months from now?

Do this for both the "I do it" and "I don't do it" paths.
Be brutally honest about the downstream effects.

My decision: [DESCRIBE THE DECISION YOU'RE FACING]
```

### Framework 5 — Regret Minimization (Jeff Bezos)
```
I'm stuck on a major life or career decision. Help me think through
it using Jeff Bezos's Regret Minimization Framework. Ask me to imagine
myself at 80 years old looking back on this moment. From that vantage
point, help me evaluate:
→ Which choice would I regret NOT taking?
→ Which risks would feel trivial in hindsight?
→ Which "safe" option would haunt me?

Don't let me hide behind logic. This framework is about emotional
clarity, not spreadsheets. Push me to be honest about what I actually want.

My decision: [DESCRIBE THE FORK IN THE ROAD YOU'RE FACING]
```

### Framework 6 — Opportunity Cost Analysis
```
I want you to help me evaluate a commitment using Opportunity Cost
Analysis. Every time I say yes to something, I'm saying no to
everything else I could do with that time, money, or energy. Make
those invisible trade-offs visible. Help me answer:
→ What specifically am I giving up by doing this?
→ What is the highest-value alternative use of the same resources?
→ If I could only pick one, which option builds more long-term value?

Don't let me treat this as a yes/no decision. Frame it as "this
versus that."

What I'm considering committing to: [DESCRIBE THE OPPORTUNITY]
```

### Framework 7 — Pre-Mortem Analysis (Gary Klein)
```
I'm about to start a project and I want you to run a Pre-Mortem
Analysis on it, based on Gary Klein's method. Imagine it's 6 months
from now and this project has failed completely. It's dead. Now work
backwards and tell me every plausible reason why it failed.

Be specific. Not generic risks like "poor execution." Give me
scenario-level detail: what went wrong, when, and why I didn't
see it coming. Then for each failure scenario, give me one
preventive action I can take right now before I start.

My project: [DESCRIBE YOUR UPCOMING PROJECT OR LAUNCH]
```

---

## THE PROMPT SCIENCE (Research-Backed Rules)

> From "RIP Think Step by Step" — Nanjing University study, 32 reasoning budgets.

| Finding | What It Means |
|---|---|
| 7,000 token flip | After ~7,000 tokens, model abandons correct answers faster than finding new ones |
| 67.5% of flips | Are deliberate reconsiderations — the model chose to replace a correct answer |
| Simple questions | Hit overthinking zone at just 2,000 tokens |
| Hard questions | Don't hit it until ~8,000 tokens |
| 60% Rule | Cap at 60% of natural output → 97% accuracy maintained |
| Output length signal | Under 4,000 tokens: 71.9% accuracy. Over 12,000 tokens: 44.7% accuracy |

**What to stop doing:** "Think step by step" on simple tasks. It's counterproductive.

**What to start doing:**
- Add length constraints ("respond in under 300 words")
- Regenerate when you see reconsideration phrases
- Match reasoning budget to task difficulty
- Use Haiku for speed, Sonnet for daily work, Opus for deep strategy

---

## CLAUDE THREE-LAYER SYSTEM

> From "Your Claude Is Running At 30%."

- **Projects** — Hold context for all ongoing work. Set once, loads automatically. No more re-explaining who you are.
- **Skills** — Reusable instruction sets that activate when relevant. Write a workflow once, Claude follows it automatically.
- **Connectors** — Let Claude reach into your actual tools (Notion, Google Drive, GitHub, Slack). One prompt, no tab switching.

Used together, these three eliminate the setup friction that makes most people feel like AI is more work than it's worth.

---

## MODEL SELECTION RULE

| Model | Use For |
|---|---|
| Haiku | Speed, quick tasks |
| Sonnet | 80–90% of daily work, quality output |
| Opus | Architecture decisions, strategic planning, deep analysis |

---

*Built from 13 God of Prompt emails (godofprompt@mail.beehiiv.com) — Robert & Alex's complete system, extracted and organized.*

---

# PART 2: GOOGLE'S PROMPT ENGINEERING FRAMEWORK

> Source: "Prompt Engineering" whitepaper by Lee Boonstra, Google (September 2024).
> This section integrates Google's official techniques with the God of Prompts system above.

---

## LLM OUTPUT CONFIGURATION

Before writing a single prompt, you need to understand the three dials that control how the model behaves.

### Temperature
Controls randomness in token selection.

| Setting | Behavior | Use When |
|---|---|---|
| 0 (greedy) | Deterministic — always picks highest probability token | Math, classification, factual tasks |
| 0.1–0.3 | Low creativity, high accuracy | Data extraction, code, structured output |
| 0.9–1.0 | High creativity, more random | Brainstorming, creative writing, ideation |

**Starting points:**
- Coherent + slightly creative: temp=0.2, top-P=0.95, top-K=30
- Especially creative: temp=0.9, top-P=0.99, top-K=40
- Less creative / factual: temp=0.1, top-P=0.9, top-K=20
- Single correct answer (math): temp=0

### Top-K and Top-P

**Top-K** — selects from the top K most likely tokens. Higher K = more varied. Top-K of 1 = greedy decoding.

**Top-P** (nucleus sampling) — selects from tokens whose cumulative probability doesn't exceed P. Range: 0 (greedy) to 1 (all tokens).

**Rule:** If temperature=0, top-K and top-P become irrelevant. Always set temperature first.

### Output Length
Setting a shorter token limit doesn't make the model more concise — it just cuts it off. If you want short output, engineer your prompt to request it explicitly. Example: `"Explain quantum physics in a tweet-length message."`

---

## GOOGLE'S 9 PROMPTING TECHNIQUES

### Technique 1 — Zero-Shot
The simplest prompt. No examples. Just a task description.

```
Classify movie reviews as POSITIVE, NEUTRAL or NEGATIVE.

Review: "Her" is a disturbing study revealing the direction humanity
is headed if AI is allowed to keep evolving, unchecked.
I wish there were more movies like this masterpiece.

Sentiment:
```

Best for: simple, well-defined tasks where the model already has strong prior knowledge.
Set temperature low (0.1) for classification. No creativity needed.

---

### Technique 2 — One-Shot & Few-Shot
Provide 1 (one-shot) or multiple (few-shot) examples to show the model the pattern you want.

**Rule of thumb:** start with 3–5 examples for few-shot. Add more for complex tasks.

**Key:** examples must be diverse, high quality, and well-written. One mistake confuses the model. For classification tasks, mix up the classes in your examples to avoid overfitting to order.

```
Parse a customer's pizza order into valid JSON:

EXAMPLE:
I want a small pizza with cheese, tomato sauce, and pepperoni.
JSON Response:
{
  "size": "small",
  "type": "normal",
  "ingredients": [["cheese", "tomato sauce", "pepperoni"]]
}

EXAMPLE:
Can I get a large pizza with tomato sauce, basil and mozzarella.
{
  "size": "large",
  "type": "normal",
  "ingredients": [["tomato sauce", "basil", "mozzarella"]]
}

Now: I would like a large pizza, with the first half cheese and
mozzarella. And the other half tomato sauce, ham and pineapple.

JSON Response:
```

---

### Technique 3 — System, Contextual, and Role Prompting

Three related but distinct types:

| Type | Purpose | Example |
|---|---|---|
| System | Sets the overall "big picture" — what the model is doing | "Classify movie reviews as positive, neutral or negative. Only return the label in uppercase." |
| Contextual | Provides specific background for the current task | "Context: You are writing for a blog about retro 80s arcade video games." |
| Role | Assigns a character/identity with tone and style | "I want you to act as a travel guide. I will write to you about my location..." |

**Role styles to choose from:** Confrontational, Descriptive, Direct, Formal, Humorous, Influential, Informal, Inspirational, Persuasive.

**Pro tip:** Requesting JSON output in a system prompt forces the model to create structure and actively limits hallucinations.

```
Classify movie reviews as positive, neutral or negative. Return valid JSON.

Schema:
MOVIE: { "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL", "name": String }
MOVIE REVIEWS: { "movie_reviews": [MOVIE] }

Review: "Her" is a disturbing study...

JSON Response:
```

---

### Technique 4 — Step-Back Prompting

Ask the model a broader, general question first. Feed that answer as context into your specific task. This activates more background knowledge before the model attempts the real problem.

**Two-step process:**

Step 1 — Ask the general "step back" question:
```
Based on popular first-person shooter action games, what are 5 fictional
key settings that contribute to a challenging and engaging level storyline?
```

Step 2 — Feed that answer as context into your original task:
```
Context: 5 engaging themes for a first person shooter video game:
1. Abandoned Military Base...
2. Cyberpunk City...
[etc.]

Take one of the themes and write a one paragraph storyline for a new level
of a first-person shooter video game that is challenging and engaging.
```

**Why it works:** the general question primes the model's knowledge base before it commits to the specific answer. Results in more accurate, less generic output.

---

### Technique 5 — Chain of Thought (CoT)

Force the model to show its reasoning steps before giving the final answer. Dramatically improves accuracy on multi-step reasoning tasks.

**Zero-shot CoT** — just add "Let's think step by step":
```
When I was 3 years old, my partner was 3 times my age. Now I am 20 years old.
How old is my partner? Let's think step by step.
```

**Few-shot CoT** — show an example with reasoning first:
```
Q: When my brother was 2 years old, I was double his age. Now I am 40.
How old is my brother? Let's think step by step.

A: When my brother was 2 years, I was 2*2=4 years old. That's an age
difference of 2 years. Now I am 40, so my brother is 40-2=38. Answer: 38.

Q: When I was 3 years old, my partner was 3 times my age. Now I am 20.
How old is my partner? Let's think step by step.
A:
```

**CoT best practices:**
- Set temperature to 0 for CoT — there's usually one correct answer
- Put the answer AFTER the reasoning, not before
- Use few-shot CoT for complex tasks — zero-shot CoT can struggle
- Any task you can "talk through" step-by-step is a good CoT candidate

**Important caveat from research:** CoT and "think step by step" can HURT accuracy past ~7,000 tokens. Use it for genuinely complex problems only. (See Principle #8 in Part 1.)

---

### Technique 6 — Self-Consistency

Run the same CoT prompt multiple times with a higher temperature to generate diverse reasoning paths. Then take the most common answer. Improves accuracy significantly on ambiguous tasks.

**Three steps:**
1. Run the same prompt 3–5 times at higher temperature (to get different reasoning paths)
2. Extract the final answer from each response
3. Pick the most commonly occurring answer

**When to use:** tasks where the model keeps giving inconsistent answers, or where the correct answer isn't obvious. High cost but higher confidence.

---

### Technique 7 — Tree of Thoughts (ToT)

Extends CoT by exploring multiple reasoning branches simultaneously, not just one linear chain. The model maintains a "tree" of thoughts and can backtrack and try different paths.

**Best for:** complex tasks requiring exploration — puzzles, game strategies, multi-step planning, creative problem-solving where many approaches need evaluation.

**Practical use:** describe the problem, ask the model to generate multiple approaches, evaluate each one, and select the best path forward.

---

### Technique 8 — ReAct (Reason & Act)

Combines reasoning with tool use. The model alternates between thinking and taking actions (web search, code execution, API calls) in a loop until it reaches an answer.

**The loop:**
1. Model reasons about the problem
2. Model takes an action (search, calculate, look up)
3. Model observes the result
4. Model reasons about the new information
5. Repeat until solved

**Best for:** tasks requiring current information, multi-step research, or anything that requires external data the model doesn't have in its training.

**Note:** ReAct requires sending the full conversation history each time. Trim useless tokens to keep it efficient.

---

### Technique 9 — Automatic Prompt Engineering (APE)

Use AI to write and evaluate your prompts. The loop:

1. Write a meta-prompt asking the model to generate N variants of a prompt
2. Evaluate each variant against a scoring metric (BLEU, ROUGE, or manual testing)
3. Pick the highest-scoring variant
4. Optionally tweak and repeat

**Example meta-prompt:**
```
We have a band merchandise t-shirt webshop, and to train a chatbot we need
various ways to order: "One Metallica t-shirt size S". Generate 10 variants,
with the same semantics but keep the same meaning.
```

This is essentially what God of Prompts calls "meta-prompting." The same principle: use AI to generate better AI instructions.

---

## GOOGLE'S BEST PRACTICES

### 1. Provide examples (most important)
One-shot or few-shot examples are the single highest-leverage improvement. They show the model exactly what "good" looks like — pattern, tone, format, and depth.

### 2. Design with simplicity
If the prompt is confusing to you, it's confusing to the model. Use short sentences, plain language, no unnecessary information.

Use action verbs to start your instruction: **Act, Analyze, Categorize, Classify, Compare, Create, Describe, Evaluate, Extract, Generate, Identify, List, Predict, Rank, Summarize, Translate, Write.**

Before:
```
I am visiting New York right now, and I'd like to hear more about great
locations. I am with two 3 year old kids. Where should we go during our vacation?
```

After:
```
Act as a travel guide for tourists. Describe great places to visit in
New York Manhattan with a 3 year old.
```

### 3. Be specific about the output
Vague instruction = vague output. Specify length, format, tone, and what to include.

DO: `Generate a 3 paragraph blog post about the top 5 video game consoles. The blog post should be informative and engaging, written in a conversational style.`

DO NOT: `Generate a blog post about video game consoles.`

### 4. Use instructions over constraints
Tell the model WHAT TO DO, not just what NOT to do. Instructions communicate the desired outcome directly. Constraints leave the model guessing what's allowed.

DO: `Generate a 1 paragraph blog post about the top 5 video game consoles. Only discuss the console, company, year, and total sales.`

DO NOT: `Generate a 1 paragraph blog post about the top 5 video game consoles. Do not list video game names.`

Constraints are still useful for safety, toxicity control, or strict format requirements — but use them sparingly.

### 5. Control the max token length
Set a max token limit in the configuration, or request it explicitly in the prompt: `"Explain quantum physics in a tweet-length message."`

### 6. Use variables in prompts
Make prompts reusable by using placeholders instead of hardcoded values:

```
VARIABLES:
{city} = "Amsterdam"

PROMPT:
You are a travel guide. Tell me a fact about the city: {city}
```

This is the same principle as God of Prompts' `[INSERT]` and `[VARIABLE]` notation.

### 7. Experiment with input formats and writing styles
The same goal can be expressed as a question, a statement, or an instruction — each produces different output. Test all three.

- **Question:** "What was the Sega Dreamcast and why was it so revolutionary?"
- **Statement:** "The Sega Dreamcast was a sixth-generation video game console..."
- **Instruction:** "Write a single paragraph that describes the Sega Dreamcast and explains why it was revolutionary."

### 8. For few-shot classification — mix up the classes
When using few-shot prompting for classification, randomize the order of classes in your examples. Otherwise the model may overfit to the sequence rather than the actual features.

Start with 6 examples and test accuracy from there.

### 9. Adapt to model updates
Prompts are not permanent. When a new model version drops, re-test your existing prompts. The same prompt can behave differently across model versions and even across different sampling settings of the same model.

### 10. Experiment with output formats
For non-creative tasks (extracting, parsing, categorizing), request structured output like JSON or XML. Benefits: forces structure, reduces hallucinations, returns sortable data.

### 11. Document every prompt attempt
This is the most skipped best practice. Use a documentation table for every prompt you build:

| Field | What to capture |
|---|---|
| Name | [name and version of your prompt] |
| Goal | [one sentence — what this attempt is trying to do] |
| Model | [model name and version] |
| Temperature | [value 0–1] |
| Token Limit | [number] |
| Top-K | [number] |
| Top-P | [number] |
| Prompt | [full prompt text] |
| Output | [actual output, or multiple outputs] |
| Result | OK / NOT OK / SOMETIMES OK |
| Feedback | [what worked, what didn't] |

Prompt engineering is iterative. You will forget what you tried. Document everything.

---

## COMBINED TECHNIQUE DECISION GUIDE

Use this to decide which approach to reach for first.

| Situation | Reach For |
|---|---|
| Simple, well-defined task | Zero-shot |
| Need a specific output format | Few-shot with examples |
| Want consistent tone/style | Role + system prompting |
| AI keeps giving generic answers | Step-back prompting |
| Multi-step reasoning or math | Chain of Thought (temp=0) |
| Getting inconsistent answers on same task | Self-consistency (run 3–5x, take majority) |
| Complex problem with many possible paths | Tree of Thoughts |
| Need real-time or external data | ReAct |
| Want to automate prompt creation | Automatic Prompt Engineering |
| Need to stop hallucinations on structured data | JSON/XML output format |
| Simple task giving long, bloated output | Add word/sentence limit constraint |
| Complex task with drift in long sessions | State Compactor (JSON save point) |
| AI doesn't know your business | Identity file + context architecture |
| Getting generic output despite good prompts | Build few-shot examples + self-critique chain |

---

## HOW GOOGLE AND GOD OF PROMPTS ALIGN

| Google Technique | God of Prompts Equivalent |
|---|---|
| System + Role + Contextual prompting | #CONTEXT + #ROLE framework |
| Few-shot examples | "Provide examples" principle |
| Chain of Thought | "Take a deep breath and work step-by-step" closing |
| Automatic Prompt Engineering | Meta-prompting / Prompt Generator |
| JSON/XML structured output | XML zoning laws + `<constraints>` tags |
| Step-back prompting | Epistemic Architect (strip assumptions first) |
| Self-consistency | Self-critique chain (Generate → Critique → Refine) |
| Document prompt attempts | Context architecture + Skills system |
| Temperature = 0 for reasoning | 60% Rule + token budget matching |
| Output length control | "60% rule" — cap at 60% of natural output |

---

*Sources: "Prompt Engineering" by Lee Boonstra, Google (September 2024) + God of Prompt newsletter (godofprompt@mail.beehiiv.com), Robert & Alex.*
