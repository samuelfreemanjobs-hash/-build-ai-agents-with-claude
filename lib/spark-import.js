const crypto = require('crypto');
const { STRATEGIES, matchService, getServiceByName } = require('./services-catalog');

const SCORE_KEYS = [
  'problemSeverity',
  'buyingSignal',
  'abilityToPay',
  'serviceFit',
  'accessibility',
  'urgency',
  'competitivePressure'
];

const DIMENSION_ALIASES = {
  problemSeverity: ['problemSeverity', 'problem_severity', 'problem severity', 'Problem Severity'],
  buyingSignal: ['buyingSignal', 'buying_signal', 'buying signal', 'Buying Signal'],
  abilityToPay: ['abilityToPay', 'ability_to_pay', 'ability to pay', 'Ability to Pay'],
  serviceFit: ['serviceFit', 'service_fit', 'service fit', 'Service Fit'],
  accessibility: ['accessibility', 'Accessibility'],
  urgency: ['urgency', 'Urgency'],
  competitivePressure: ['competitivePressure', 'competitive_pressure', 'competitive pressure', 'Competitive Pressure']
};

function pick(obj, keys) {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return undefined;
}

function normalizeStrategy(value) {
  if (!value) return 'A';
  const raw = String(value).trim().toUpperCase();
  if (/^[A-F]$/.test(raw)) return raw;
  const byLabel = STRATEGIES.find(s => s.label.toLowerCase() === raw.toLowerCase());
  if (byLabel) return byLabel.id;
  const letter = raw.match(/\b([A-F])\b/);
  return letter ? letter[1] : 'A';
}

function normalizeBreakdown(card) {
  const direct = pick(card, ['scoreBreakdown', 'score_breakdown', 'opportunityScoreBreakdown', 'breakdown']);
  if (direct && typeof direct === 'object') {
    const normalized = {};
    for (const key of SCORE_KEYS) {
      const aliases = DIMENSION_ALIASES[key];
      normalized[key] = Number(pick(direct, aliases) ?? direct[key] ?? 0);
    }
    if (Object.values(normalized).some(v => v > 0)) return normalized;
  }

  const score = Number(pick(card, ['score', 'opportunityScore', 'opportunity_score', 'totalScore', 'total_score']));
  if (score > 0) {
    const ratio = score / 100;
    return {
      problemSeverity: Math.round(25 * ratio),
      buyingSignal: Math.round(20 * ratio),
      abilityToPay: Math.round(15 * ratio),
      serviceFit: Math.round(15 * ratio),
      accessibility: Math.round(10 * ratio),
      urgency: Math.round(10 * ratio),
      competitivePressure: Math.round(5 * ratio)
    };
  }

  return {
    problemSeverity: 12,
    buyingSignal: 8,
    abilityToPay: 7,
    serviceFit: 8,
    accessibility: 5,
    urgency: 4,
    competitivePressure: 2
  };
}

function normalizeProblems(card) {
  const raw = pick(card, [
    'detectedProblems',
    'detected_problems',
    'problems',
    'buyingSignals',
    'buying_signals',
    'signals'
  ]);

  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    return raw.split(/\n|;/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  }
  return ['Operational inefficiency detected'];
}

function resolveService(card, industry, problems) {
  const raw = pick(card, ['matchedService', 'matched_service', 'recommendedService', 'recommended_service', 'service']);
  if (raw) {
    const byName = getServiceByName(raw);
    if (byName) return byName;
    const fuzzy = matchService(industry, problems);
    if (fuzzy) return fuzzy;
  }
  return matchService(industry, problems);
}

function extractCards(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.cards)) return payload.cards;
  if (Array.isArray(payload.opportunities)) return payload.opportunities;
  if (Array.isArray(payload.leads)) return payload.leads;
  if (Array.isArray(payload.outreachQueue)) return payload.outreachQueue;
  if (Array.isArray(payload.outreach_queue)) return payload.outreach_queue;
  if (payload.company || payload.Company) return [payload];
  return [];
}

function mapSparkCardToLead(card, { getTier, bookingUrl }) {
  const company = pick(card, ['company', 'Company', 'name', 'companyName', 'company_name']);
  if (!company) return null;

  const location = pick(card, ['location', 'Location', 'city', 'region']) || 'Unknown';
  const industry = pick(card, ['industry', 'Industry', 'sector']) || 'Industrial Manufacturing';
  const problems = normalizeProblems(card);
  const breakdown = normalizeBreakdown(card);
  const totalScore = Number(pick(card, ['score', 'opportunityScore', 'opportunity_score', 'totalScore', 'total_score']))
    || Object.values(breakdown).reduce((a, b) => a + b, 0);
  const tier = getTier(totalScore);
  const service = resolveService(card, industry, problems);
  const strategyId = normalizeStrategy(pick(card, ['outreachStrategy', 'outreach_strategy', 'strategy']));
  const strategy = STRATEGIES.find(s => s.id === strategyId) || STRATEGIES[0];

  const decisionMaker = pick(card, ['decisionMaker', 'decision_maker', 'Decision Maker', 'contact', 'decisionMakerName']);
  const employeeCount = pick(card, ['employeeCount', 'employee_count', 'employees', 'size', 'headcount']);
  const url = pick(card, ['url', 'website', 'websiteUrl', 'website_url', 'domain']);
  const giveBeforeAsk = pick(card, ['giveBeforeAsk', 'give_before_ask', 'giveBeforeAskAsset', 'asset']);
  const diagnostic = pick(card, ['diagnostic', 'miniConsultingDiagnostic', 'mini_consulting_diagnostic', 'consultingDiagnostic']);
  const evidenceSignals = pick(card, ['evidenceSignals', 'evidence_signals', 'evidence', 'buyingSignalSummary']) || 'Imported from Gemini Spark';
  const outreachSubject = pick(card, ['outreachSubject', 'outreach_subject', 'subject', 'emailSubject', 'email_subject'])
    || `${strategy.prefix} ${company}`;
  const outreachBody = pick(card, ['outreachBody', 'outreach_body', 'message', 'messageDraft', 'message_draft', 'emailBody', 'email_body'])
    || `${strategy.prefix}\n\nHi,\n\nI've been analyzing ${industry} operations in ${location} and identified specific opportunities at ${company}.\n\nWould you be open to a 15-min diagnostic call? Book here: ${bookingUrl || '[BOOKING_URL]'}\n\nBest,\nHUNTER Intelligence`;

  const notes = [
    pick(card, ['notes', 'Notes', 'summary']),
    pick(card, ['tier', 'Tier']) ? `Spark tier: ${pick(card, ['tier', 'Tier'])}` : null,
    pick(card, ['pool', 'queue']) ? `Spark pool: ${pick(card, ['pool', 'queue'])}` : null,
    'Imported via Gemini Spark webhook'
  ].filter(Boolean).join(' | ');

  return {
    id: crypto.randomUUID(),
    company,
    url: url || `https://www.${company.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
    location,
    industry,
    size: String(employeeCount || '50'),
    decision_maker: decisionMaker || 'Plant Manager',
    opportunity_title: `${industry} Operational Intelligence`,
    score: totalScore,
    score_breakdown: breakdown,
    tier: tier.label,
    stage: 'New Opportunity',
    estimated_value: service.price,
    value_range: service.priceRange,
    matched_service: service.name,
    detected_problems: problems,
    evidence_signals: evidenceSignals,
    give_before_ask: giveBeforeAsk || 'Custom operational diagnostic',
    diagnostic: diagnostic || `${tier.emoji} ${company} scores ${totalScore} — ${tier.label} tier. Matched: ${service.name}.`,
    outreach_strategy: strategyId,
    outreach_subject: outreachSubject,
    outreach_body: outreachBody,
    notes,
    source: 'gemini-spark',
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
}

async function importSparkPayload(payload, { store, getTier, bookingUrl, sendSlackNotification }) {
  const cards = extractCards(payload);
  if (!cards.length) {
    return { imported: 0, skipped: 0, errors: ['No opportunity cards found in payload'], leads: [] };
  }

  const { data: existing } = await store.from('leads').select('*');
  const existingNames = new Set((existing || []).map(l => l.company?.toLowerCase()));

  const created = [];
  const skipped = [];
  const errors = [];

  for (const card of cards) {
    try {
      const lead = mapSparkCardToLead(card, { getTier, bookingUrl });
      if (!lead) {
        errors.push('Skipped card with no company name');
        continue;
      }
      if (existingNames.has(lead.company.toLowerCase())) {
        skipped.push(lead.company);
        continue;
      }

      const { data, error } = await store.from('leads').insert([lead]).select();
      if (error) throw error;

      existingNames.add(lead.company.toLowerCase());
      created.push(data[0]);

      if (lead.tier === 'HOT' && sendSlackNotification) {
        await sendSlackNotification(
          `🔥 Spark import — HOT lead: *${lead.company}*\nScore: ${lead.score} | ${lead.location}\nService: ${lead.matched_service} (${lead.value_range})`
        );
      }
    } catch (e) {
      errors.push(`${card.company || card.Company || 'unknown'}: ${e.message}`);
    }
  }

  return {
    imported: created.length,
    skipped: skipped.length,
    skippedCompanies: skipped,
    errors,
    leads: created
  };
}

function verifySparkSecret(req, secret) {
  if (!secret) return true;
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const headerSecret = req.headers['x-spark-secret'];
  const provided = bearer || headerSecret;
  return provided === secret;
}

module.exports = {
  extractCards,
  mapSparkCardToLead,
  importSparkPayload,
  verifySparkSecret
};
