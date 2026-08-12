# Factory Patterns

Reusable patterns extracted from Freeman Intel and AI Proposals Agent.

## Pattern 1: Approve-before-impact

**Problem:** Autonomous agents that email carriers or submit bids create liability.

**Solution:** Pipeline stages with `mode: human` sit between draft and send. UI shows source vs extracted side-by-side.

**Freeman Intel:** Every menu item has a default approval mode (approve all, approve send, auto internal).

**AI Proposals Agent:** Tiering (T0–T3) drives human gate depth.

## Pattern 2: Deterministic core + narrative shell

**Problem:** LLMs hallucinate prices, compliance status, and quantities.

**Solution:** Binding facts flow through `scripts/*.py`. Model writes around them.

| Product | Deterministic modules |
|---------|----------------------|
| AI Proposals Agent | pricing_engine, compliance_validator, case_study_scorer |
| Freeman Intel | routing-guide-rules, po-release-matcher, scac-allowlist |

## Pattern 3: Reactive skills

**Problem:** Loading all capabilities into context burns tokens.

**Solution:** `skills/<name>/SKILL.md` files load per pipeline stage. Cursor-compatible format.

## Pattern 4: Outcome bundles

**Problem:** Selling "agents" confuses buyers and encourages scope creep.

**Solution:** Three bundles per product. Menu items map to internal agent roles. Customers never pick individual agents.

## Pattern 5: Run log as audit trail

**Problem:** No proof of what the system did when a chargeback or bid dispute arises.

**Solution:** JSONL run log conforming to `schemas/run-log.schema.json`. HALT if write fails.

## Pattern 6: Token economics gate

Before choosing multi-agent, run economics:

```bash
python3 scripts/token_economics.py
```

Block multi-agent if COGS exceeds 2% of lowest tier monthly price per run.

## Pattern 7: Email-first wedge

Both corridor products start without TMS/API integration:

- Freeman Intel: Gmail/Outlook + PDF ASN + CSV expected inbound
- AI Proposals Agent: RFP upload + operator KB

Integrations are phase 2+, not day 1.

## Anti-patterns (do not factory-default these)

- Agent marketplaces where customers compose their own agents
- Model-generated pricing or compliance status
- Silent truncation of tool output
- Shipping on schema validation failure after one retry
- Training on customer NDA documents without explicit consent
