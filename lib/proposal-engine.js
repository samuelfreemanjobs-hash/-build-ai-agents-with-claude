const { getServiceById, getServiceByName, RETAINER } = require('./services-catalog');

function buildProposalPrompt(lead, service, options = {}) {
  const svc = typeof service === 'string' ? (getServiceById(service) || getServiceByName(service)) : service;
  if (!svc) throw new Error('Service not found');

  return `You are a senior solutions architect at HUNTER Intelligence, writing a winning proposal for a mid-market manufacturer.

CLIENT:
- Company: ${lead.company}
- Industry: ${lead.industry || 'Manufacturing'}
- Location: ${lead.location}
- Size: ${lead.size || lead.employeeCount || '50-200'} employees
- Decision Maker: ${lead.decision_maker || lead.decisionMaker || 'Operations Leader'}
- Detected Problems: ${(lead.detected_problems || lead.detectedProblems || []).join('; ')}
- Evidence: ${lead.evidence_signals || lead.evidenceSignals || 'AI-analyzed operational data'}
- HUNTER Score: ${lead.score || 'N/A'} (${lead.tier || 'N/A'} tier)

PROPOSED SERVICE: ${svc.name}
- Investment: ${svc.priceRange || '$' + svc.price.toLocaleString()}
- Timeline: ${svc.duration}
- Deliverables: ${svc.deliverables.join('; ')}
- ROI: ${svc.roi}

${options.includeRetainer ? `OPTIONAL RETAINER: ${RETAINER.name} at ${RETAINER.priceRange}` : ''}

Write a professional proposal with these sections:
1. EXECUTIVE SUMMARY (3 sentences — problem, solution, outcome)
2. SITUATION ANALYSIS (what we found, specific to their company)
3. PROPOSED SOLUTION (scope, deliverables, timeline)
4. INVESTMENT (pricing table with line items)
5. ROI PROJECTION (quantified savings/returns within 90 days)
6. WHY HUNTER (3 differentiators — speed, manufacturing focus, AI-powered diagnostics)
7. NEXT STEPS (sign, kickoff call, Week 1 plan)
8. TERMS (50% upfront, 50% on delivery, 30-day warranty)

Tone: Confident, specific, no fluff. Use their company name and industry throughout.
Format as clean markdown. Be direct — manufacturing leaders respect brevity.`;
}

function buildDiagnosticPrompt(lead) {
  return `You are HUNTER Intelligence, an operational diagnostics firm for mid-market manufacturers.

Analyze this company and produce a diagnostic report they would receive BEFORE any sales pitch.

Company: ${lead.company}
Industry: ${lead.industry || 'Manufacturing'}
Location: ${lead.location}
Website: ${lead.url || 'N/A'}
Size: ${lead.size || 'Unknown'}
Detected Problems: ${(lead.detected_problems || []).join('; ')}
Evidence: ${lead.evidence_signals || 'Public data analysis'}

Produce a diagnostic report with:
1. OPERATIONAL FRICTION SCORE (1-100 with brief justification)
2. TOP 3 FRICTION POINTS (specific, not generic — reference their industry)
3. ESTIMATED ANNUAL COST OF INACTION ($ range based on company size)
4. QUICK WINS (2 things they could fix this week without hiring anyone)
5. STRATEGIC RECOMMENDATION (which HUNTER service fits best and why)
6. 90-DAY ROI PROJECTION (if they act now)

This is a GIVE-BEFORE-ASK asset. Be genuinely helpful. No hard sell.
Format as professional markdown. Use specific manufacturing terminology.`;
}

function parseProposalSections(text) {
  const sections = {};
  const regex = /^#{1,2}\s+(.+)$/gm;
  let match;
  const positions = [];

  while ((match = regex.exec(text)) !== null) {
    positions.push({ title: match[1].trim(), index: match.index });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    const body = text.slice(start, end).replace(/^#{1,2}\s+.+\n/, '').trim();
    sections[positions[i].title.toLowerCase().replace(/[^a-z0-9]+/g, '_')] = body;
  }

  return { raw: text, sections };
}

module.exports = { buildProposalPrompt, buildDiagnosticPrompt, parseProposalSections };
