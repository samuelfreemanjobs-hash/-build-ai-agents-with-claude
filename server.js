require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Resend } = require('resend');
const axios = require('axios');
const cron = require('node-cron');
const { SERVICES, STRATEGIES, INDUSTRIES, SCORING_DIMENSIONS, matchService } = require('./lib/services-catalog');
const { registerBusinessRoutes } = require('./lib/routes-business');
const { createStore } = require('./lib/store');
const {
  sendOutreachEmail,
  sendBatchOutreach,
  getBatchCandidates,
  extractEmail,
  handleResendEvent
} = require('./lib/outreach-engine');
const { importSparkPayload, verifySparkSecret } = require('./lib/spark-import');

// ─── CONFIGURATION ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
const SPARK_WEBHOOK_SECRET = process.env.SPARK_WEBHOOK_SECRET;

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const store = createStore(supabase);
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const app = express();
app.use(cors());
app.use('/api/webhooks/resend', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));

const SERVICE_NAMES = SERVICES.map(s => s.name);

const getTier = (score) => {
  if (score >= 90) return { label: 'HOT', emoji: '🔥' };
  if (score >= 75) return { label: 'HIGH', emoji: '🟠' };
  if (score >= 60) return { label: 'MEDIUM', emoji: '🟡' };
  return { label: 'WATCH', emoji: '⚪' };
};

const formatCurrency = (val) => {
  if (!val) return '$0';
  if (val >= 1e6) return '$' + (val / 1e6).toFixed(1) + 'M';
  if (val >= 1e3) return '$' + (val / 1e3).toFixed(0) + 'K';
  return '$' + val;
};

// ─── AI SCORING ENGINE ────────────────────────────────────────────
async function scoreCompany(companyData) {
  const { name, url, industry, location, employeeCount } = companyData;

  let websiteContent = '';
  if (url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'HUNTER-Intelligence/1.0' }
      });
      const html = response.data;
      const text = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000);
      websiteContent = text;
    } catch (e) {
      console.log(`Could not scrape ${url}: ${e.message}`);
    }
  }

  if (!genAI) {
    return buildFallbackScore(name, industry, location, employeeCount);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const scoringPrompt = `
You are a revenue intelligence analyst. Score this manufacturing company across 7 dimensions for sales qualification.

Company: ${name}
Industry: ${industry || 'Unknown'}
Location: ${location || 'Unknown'}
Employees: ${employeeCount || 'Unknown'}

Website Content (truncated):
${websiteContent || 'No website content available'}

Score each dimension from 0 to max:
1. Problem Severity (0-25): How much operational friction do they likely have? Look for signs of: spreadsheet chaos, manual processes, ERP gaps, quality issues, delays.
2. Buying Signal (0-20): Are they hiring for ops roles? Mentioning digital transformation? Attending automation expos? Any explicit signals of change?
3. Ability to Pay (0-15): Based on employee count and industry. 20-100 employees = 5-8, 101-500 = 9-12, 500+ = 13-15.
4. Service Fit (0-15): How well do our services match their industry? CNC/Auto/3PL = high fit.
5. Accessibility (0-10): Based on location and company structure. US-based = higher.
6. Urgency (0-10): Are there deadlines? Industry pressures? OEM launch timelines?
7. Competitive Pressure (0-5): Are competitors in their region? Regional density.

Return ONLY JSON:
{
  "problemSeverity": number,
  "buyingSignal": number,
  "abilityToPay": number,
  "serviceFit": number,
  "accessibility": number,
  "urgency": number,
  "competitivePressure": number,
  "detectedProblems": ["problem1", "problem2", "problem3"],
  "evidenceSignals": "specific signal found",
  "recommendedService": "one of: ${SERVICE_NAMES.join(', ')}"
}
`;

  try {
    const result = await model.generateContent(scoringPrompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!parsed) {
      return buildFallbackScore(name, industry, location, employeeCount);
    }

    const scoreBreakdown = {
      problemSeverity: parsed.problemSeverity || 10,
      buyingSignal: parsed.buyingSignal || 8,
      abilityToPay: parsed.abilityToPay || 7,
      serviceFit: parsed.serviceFit || 8,
      accessibility: parsed.accessibility || 5,
      urgency: parsed.urgency || 4,
      competitivePressure: parsed.competitivePressure || 2
    };

    const totalScore = Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0);
    const tier = getTier(totalScore);
    const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
    const recommendedService = parsed.recommendedService || SERVICE_NAMES[0];
    const matchedSvc = matchService(industry, parsed.detectedProblems);

    return {
      scoreBreakdown,
      detectedProblems: parsed.detectedProblems || ['Operational inefficiency detected'],
      evidenceSignals: parsed.evidenceSignals || 'AI-analyzed public data',
      recommendedService: recommendedService || matchedSvc.name,
      diagnostic: `${tier.emoji} ${name} scores ${totalScore} — ${tier.label} tier opportunity. Focus on ${recommendedService}.`,
      outreachStrategy: strategy.id,
      outreachSubject: `${strategy.prefix} ${name}`,
      outreachBody: `${strategy.prefix}\n\nHi [Decision Maker],\n\nI've been tracking ${industry || 'manufacturing'} in ${location || 'your region'} and noticed an opportunity to optimize ${recommendedService}.\n\nWould you be open to a 15-min diagnostic call?\n\nBest,\nHUNTER Intelligence`
    };
  } catch (error) {
    console.error('Gemini scoring error:', error.message);
    return buildFallbackScore(name, industry, location, employeeCount);
  }
}

function buildFallbackScore(name, industry, location, employeeCount) {
  const emp = parseInt(employeeCount, 10) || 50;
  const abilityToPay = emp >= 500 ? 13 : emp >= 101 ? 10 : emp >= 20 ? 7 : 5;
  const serviceFit = ['CNC Machining', 'Tier II Automotive Stamping', '3PL Warehousing'].includes(industry) ? 12 : 8;

  const scoreBreakdown = {
    problemSeverity: 12,
    buyingSignal: 8,
    abilityToPay,
    serviceFit,
    accessibility: location && /US|USA|United States/i.test(location) ? 8 : 5,
    urgency: 4,
    competitivePressure: 2
  };

  const totalScore = Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0);
  const tier = getTier(totalScore);
  const strategy = STRATEGIES[0];

  return {
    scoreBreakdown,
    detectedProblems: ['Manual processes detected'],
    evidenceSignals: 'Scored via fallback logic',
    recommendedService: SERVICE_NAMES[0],
    diagnostic: `${tier.emoji} ${name} scores ${totalScore} — ${tier.label} tier opportunity. Focus on ${SERVICE_NAMES[0]}.`,
    outreachStrategy: strategy.id,
    outreachSubject: `${strategy.prefix} ${name}`,
    outreachBody: `${strategy.prefix}\n\nHi [Decision Maker],\n\nI've been tracking ${industry || 'manufacturing'} in ${location || 'your region'} and noticed an opportunity to optimize ${SERVICE_NAMES[0]}.\n\nWould you be open to a 15-min diagnostic call?\n\nBest,\nHUNTER Intelligence`
  };
}

// ─── SLACK NOTIFICATION ──────────────────────────────────────────
async function sendSlackNotification(message) {
  if (!SLACK_WEBHOOK) return;
  try {
    await axios.post(SLACK_WEBHOOK, {
      text: message,
      username: 'HUNTER Intelligence',
      icon_emoji: ':hunter:'
    });
  } catch (e) {
    console.error('Slack error:', e.message);
  }
}

// ─── GEMINI SPARK WEBHOOK ───────────────────────────────────────
app.post('/api/webhooks/spark', async (req, res) => {
  if (!requireStore(res)) return;
  if (!verifySparkSecret(req, SPARK_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid or missing Spark webhook secret' });
  }
  try {
    const result = await importSparkPayload(req.body, {
      store,
      getTier,
      bookingUrl: process.env.BOOKING_URL,
      sendSlackNotification
    });
    res.json({ received: true, ...result });
  } catch (error) {
    console.error('Spark webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ─── RESEND WEBHOOK ─────────────────────────────────────────────
app.post('/api/webhooks/resend', async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    const result = await handleResendEvent(event, {
      store,
      sendSlackNotification,
      getLeadById: async (id) => {
        const { data } = await store.from('leads').select('*').eq('id', id).single();
        return data;
      }
    });
    res.json({ received: true, ...result });
  } catch (error) {
    console.error('Resend webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

function requireStore(res) {
  return true;
}

function dbUnavailable(res) {
  res.status(503).json({ error: 'Storage not available.' });
  return false;
}

// ─── API ROUTES ──────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      storage: store.mode,
      supabase: store.mode === 'supabase',
      gemini: !!genAI,
      resend: !!resend,
      slack: !!SLACK_WEBHOOK,
      booking: process.env.BOOKING_URL || null,
      webhooks: {
        resend: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/api/webhooks/resend` : null,
        spark: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/api/webhooks/spark` : null
      }
    }
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    scoringDimensions: SCORING_DIMENSIONS,
    services: SERVICE_NAMES,
    serviceCatalog: SERVICES,
    strategies: STRATEGIES,
    industries: INDUSTRIES
  });
});

app.post('/api/score', async (req, res) => {
  try {
    const { company, url, industry, location, employeeCount } = req.body;

    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const scored = await scoreCompany({
      name: company,
      url: url || '',
      industry: industry || '',
      location: location || '',
      employeeCount: employeeCount || 50
    });

    const totalScore = Object.values(scored.scoreBreakdown).reduce((a, b) => a + b, 0);
    const tier = getTier(totalScore);

    res.json({ ...scored, score: totalScore, tier: tier.label, tierEmoji: tier.emoji });
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { company, url, location, industry, decisionMaker, employeeCount } = req.body;

    if (!company || !location) {
      return res.status(400).json({ error: 'Company and location are required' });
    }

    let scoredData = {};
    if (!req.body.scoreBreakdown) {
      scoredData = await scoreCompany({ name: company, url, industry, location, employeeCount });
    }

    const breakdown = req.body.scoreBreakdown || scoredData.scoreBreakdown;
    const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const tier = getTier(totalScore);

    const lead = {
      id: crypto.randomUUID(),
      company,
      url: url || `https://www.${company.toLowerCase().replace(/\s/g, '')}.com`,
      location,
      industry: industry || 'Industrial Manufacturing',
      size: String(employeeCount || '50'),
      decision_maker: decisionMaker || 'Plant Manager',
      opportunity_title: `${industry || 'Industrial'} Operational Intelligence`,
      score: totalScore,
      score_breakdown: breakdown,
      tier: tier.label,
      stage: 'New Opportunity',
      estimated_value: req.body.estimatedValue || 50000,
      value_range: `$${((req.body.estimatedValue || 50000) - 5000).toLocaleString()} – $${((req.body.estimatedValue || 50000) + 10000).toLocaleString()}`,
      matched_service: req.body.matchedService || scoredData.recommendedService || SERVICE_NAMES[0],
      detected_problems: req.body.detectedProblems || scoredData.detectedProblems || ['Operational inefficiency detected'],
      evidence_signals: req.body.evidenceSignals || scoredData.evidenceSignals || 'AI-enriched lead',
      give_before_ask: req.body.giveBeforeAsk || 'Custom diagnostic asset',
      diagnostic: req.body.diagnostic || scoredData.diagnostic || `${tier.emoji} ${company} scores ${totalScore} — ${tier.label} tier.`,
      outreach_strategy: req.body.outreachStrategy || scoredData.outreachStrategy || STRATEGIES[0].id,
      outreach_subject: req.body.outreachSubject || scoredData.outreachSubject || `AI Opportunity: ${company}`,
      outreach_body: req.body.outreachBody || scoredData.outreachBody || `Hi Team,\n\nI found an opportunity for ${company} to optimize operations.\n\nBest,\nHUNTER`,
      notes: req.body.notes || 'Created via API.',
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await store
      .from('leads')
      .insert([lead])
      .select();

    if (error) throw error;

    if (tier.label === 'HOT') {
      await sendSlackNotification(`🔥 HOT LEAD: ${company}\nScore: ${totalScore}\nLocation: ${location}\nService: ${lead.matched_service}`);
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { data, error } = await store
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { data, error } = await store
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      last_activity: new Date().toISOString()
    };
    delete updates.id;

    const { data, error } = await store
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { id } = req.params;
    const { error } = await store
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/outreach/send', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { leadId, to, subject, body, strategy } = req.body;
    if (!leadId) return res.status(400).json({ error: 'Lead ID is required' });

    const { data: lead, error } = await store.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return res.status(404).json({ error: 'Lead not found' });

    const recipient = to || extractEmail(lead);
    if (!recipient) return res.status(400).json({ error: 'Recipient email required' });

    const result = await sendOutreachEmail({
      store, resend, lead, to: recipient, subject, body, strategy
    });

    if (lead.tier === 'HOT') {
      await sendSlackNotification(`📧 Outreach sent to HOT lead *${lead.company}* → ${recipient}`);
    }

    res.json(result);
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/outreach/batch/preview', async (req, res) => {
  if (!requireStore(res)) return;
  try {
    const { tier, tiers } = req.query;
    const { data: leads } = await store.from('leads').select('*');
    const tierList = tiers ? tiers.split(',') : (tier ? [tier] : ['HOT', 'HIGH']);
    const candidates = getBatchCandidates(leads || [], { tiers: tierList });

    res.json({
      count: candidates.length,
      tiers: tierList,
      leads: candidates.map(l => ({
        id: l.id,
        company: l.company,
        tier: l.tier,
        score: l.score,
        email: extractEmail(l),
        subject: l.outreach_subject,
        stage: l.stage
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/outreach/batch', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { tier, tiers, leadIds, dryRun } = req.body;
    const { data: leads } = await store.from('leads').select('*');

    const results = await sendBatchOutreach({
      store, resend,
      leads: leads || [],
      options: { tier, tiers, leadIds, dryRun: !!dryRun }
    });

    if (!dryRun && results.sent.length > 0) {
      await sendSlackNotification(
        `📧 *Batch outreach complete*\nSent: ${results.sent.length}\nFailed: ${results.failed.length}\n` +
        results.sent.map(r => `• ${r.company} → ${r.to}`).join('\n')
      );
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/outreach/logs', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { leadId } = req.query;
    let query = store.from('outreach_logs').select('*').order('sent_at', { ascending: false });
    if (leadId) query = query.eq('lead_id', leadId);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  if (!requireStore(res)) return;

  try {
    const { data: leads, error } = await store
      .from('leads')
      .select('*');

    if (error) throw error;

    const active = leads.filter(l => l.stage !== 'Closed Won / Client');
    const won = leads.filter(l => l.stage === 'Closed Won / Client');

    const byIndustry = {};
    leads.forEach(l => {
      if (!byIndustry[l.industry]) byIndustry[l.industry] = { count: 0, totalValue: 0, avgScore: 0 };
      byIndustry[l.industry].count++;
      byIndustry[l.industry].totalValue += l.estimated_value || 0;
      byIndustry[l.industry].avgScore += l.score || 0;
    });
    Object.keys(byIndustry).forEach(k => {
      byIndustry[k].avgScore = Math.round(byIndustry[k].avgScore / byIndustry[k].count);
    });

    const byStrategy = {};
    leads.forEach(l => {
      const s = l.outreach_strategy || 'Unknown';
      if (!byStrategy[s]) byStrategy[s] = { count: 0, won: 0 };
      byStrategy[s].count++;
      if (l.stage === 'Closed Won / Client') byStrategy[s].won++;
    });

    const byTier = {};
    leads.forEach(l => {
      const t = l.tier || 'WATCH';
      byTier[t] = (byTier[t] || 0) + 1;
    });

    const byStage = {};
    leads.forEach(l => {
      const s = l.stage || 'New Opportunity';
      byStage[s] = (byStage[s] || 0) + 1;
    });

    const pipelineValue = active.reduce((s, l) => s + (l.estimated_value || 0), 0);
    const avgDealSize = active.length ? Math.round(pipelineValue / active.length) : 0;
    const hotLeads = leads.filter(l => l.score >= 90);

    res.json({
      totalLeads: leads.length,
      activeCount: active.length,
      wonCount: won.length,
      hotCount: hotLeads.length,
      pipelineValue,
      avgDealSize,
      byIndustry,
      byStrategy,
      byTier,
      byStage,
      hotLeads: hotLeads.map(l => ({ id: l.id, company: l.company, score: l.score, tier: l.tier })),
      winRate: (won.length / (active.length + won.length) * 100) || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SEED ENDPOINT ──────────────────────────────────────────────
app.post('/api/seed', async (req, res) => {
  if (!requireStore(res)) return;
  try {
    const fs = require('fs');
    const path = require('path');
    const seeds = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/seed-leads.json'), 'utf8'));
    const { data: existing } = await store.from('leads').select('*');
    const existingNames = new Set((existing || []).map(l => l.company?.toLowerCase()));
    const created = [];

    for (const seed of seeds) {
      if (existingNames.has(seed.company.toLowerCase())) continue;
      const breakdown = seed.scoreBreakdown;
      const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
      const tier = getTier(totalScore);
      const strategy = STRATEGIES.find(s => s.id === seed.outreachStrategy) || STRATEGIES[0];
      const lead = {
        id: crypto.randomUUID(),
        company: seed.company,
        url: seed.url,
        location: seed.location,
        industry: seed.industry,
        size: String(seed.employeeCount),
        decision_maker: seed.decisionMaker,
        score: totalScore,
        score_breakdown: breakdown,
        tier: tier.label,
        stage: 'New Opportunity',
        estimated_value: 50000,
        matched_service: seed.matchedService,
        detected_problems: seed.detectedProblems,
        evidence_signals: seed.evidenceSignals,
        outreach_strategy: seed.outreachStrategy,
        outreach_subject: `${strategy.prefix} ${seed.company}`,
        outreach_body: `${strategy.prefix}\n\nHi,\n\nI've been analyzing ${seed.industry} operations in ${seed.location} and identified specific opportunities at ${seed.company}.\n\nWould you be open to a 15-min diagnostic call? Book here: ${process.env.BOOKING_URL || '[BOOKING_URL]'}\n\nBest,\nHUNTER Intelligence`,
        notes: seed.notes,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      const { data } = await store.from('leads').insert([lead]).select();
      created.push(data[0]);
    }
    res.json({ created: created.length, leads: created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CRON JOBS ──────────────────────────────────────────────

if (store.mode === 'supabase') {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily follow-up check...');
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data, error } = await store
        .from('leads')
        .select('*')
        .eq('stage', 'Outreach Sent')
        .lt('last_activity', sevenDaysAgo.toISOString());

      if (error) throw error;

      for (const lead of data) {
        await store
          .from('leads')
          .update({
            stage: 'Diagnostic Ready',
            notes: `[${new Date().toISOString()}] Auto-follow-up triggered: 7-day wait exceeded.`,
            last_activity: new Date().toISOString()
          })
          .eq('id', lead.id);

        await sendSlackNotification(`⏰ Follow-up reminder: ${lead.company} has been waiting 7+ days.`);
      }

      console.log(`Processed ${data.length} follow-ups.`);
    } catch (e) {
      console.error('Cron follow-up error:', e);
    }
  });

  cron.schedule('0 12 * * 1', async () => {
    console.log('Generating weekly report...');
    try {
      const { data: leads } = await store.from('leads').select('*');
      if (!leads) return;

      const hot = leads.filter(l => l.score >= 90);
      const won = leads.filter(l => l.stage === 'Closed Won / Client');
      const pipeline = leads.filter(l => l.stage !== 'Closed Won / Client');

      const report = `📊 *HUNTER Weekly Report*\n\n` +
        `🔥 Hot Leads: ${hot.length}\n` +
        `💼 Pipeline: ${pipeline.length} leads (${formatCurrency(pipeline.reduce((s, l) => s + (l.estimated_value || 0), 0))})\n` +
        `🏆 Closed Won: ${won.length}\n` +
        `📈 Win Rate: ${(won.length / (pipeline.length + won.length) * 100).toFixed(1)}%\n\n` +
        hot.map(l => `• 🔥 ${l.company} (${l.score})`).join('\n');

      await sendSlackNotification(report);
    } catch (e) {
      console.error('Weekly report error:', e);
    }
  });
}

registerBusinessRoutes(app, { store, genAI, resend, sendSlackNotification, requireStore });

// Serve frontend in production
const path = require('path');
app.use('/content', express.static(path.join(__dirname, 'content')));
app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 HUNTER Autonomous OS running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
