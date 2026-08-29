const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Resend } = require('resend');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── CONFIGURATION ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ─── SCORING ENGINE ──────────────────────────────────────────────
const SCORING_DIMENSIONS = {
  problemSeverity: { max: 25, label: 'Problem Severity' },
  buyingSignal: { max: 20, label: 'Buying Signal' },
  abilityToPay: { max: 15, label: 'Ability to Pay' },
  serviceFit: { max: 15, label: 'Service Fit' },
  accessibility: { max: 10, label: 'Accessibility' },
  urgency: { max: 10, label: 'Urgency' },
  competitivePressure: { max: 5, label: 'Competitive Pressure' }
};

const SERVICES = [
  'Spreadsheet Elimination System',
  'KPI Command Center & Executive Dashboard Sprint',
  'CNC Spindle Telemetry & CMM Queue Bridge',
  'Die Tryout Milestone & Tooling Validation Bridge',
  'Wire Harness Continuity & QA Ingestion Engine',
  '3PL Cross-Dock & VMI Buffer Exception Dashboard',
  'Conversion Website Sprint + RFQ Spec Ingestion Engine'
];

const STRATEGIES = [
  { id: 'A', label: 'Diagnostic', prefix: 'I noticed something...' },
  { id: 'B', label: 'Opportunity', prefix: 'I found an opportunity...' },
  { id: 'C', label: 'Competitive', prefix: 'Your competitors are doing...' },
  { id: 'D', label: 'Build', prefix: 'I mocked up what this could look like...' },
  { id: 'E', label: 'Audit', prefix: 'I ran a quick audit...' },
  { id: 'F', label: 'Intelligence', prefix: 'I found three things you may want to know...' }
];

const INDUSTRIES = [
  'CNC Machining', 'Tier II Automotive Stamping', '3PL Warehousing',
  'Tool & Die Validation', 'Wire Harness Assembly', 'Heavy Steel Fabrication',
  'Precision Injection Molding', 'Aerospace Components'
];

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
  "recommendedService": "one of: ${SERVICES.join(', ')}"
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
    const recommendedService = parsed.recommendedService || SERVICES[0];

    return {
      scoreBreakdown,
      detectedProblems: parsed.detectedProblems || ['Operational inefficiency detected'],
      evidenceSignals: parsed.evidenceSignals || 'AI-analyzed public data',
      recommendedService,
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
    recommendedService: SERVICES[0],
    diagnostic: `${tier.emoji} ${name} scores ${totalScore} — ${tier.label} tier opportunity. Focus on ${SERVICES[0]}.`,
    outreachStrategy: strategy.id,
    outreachSubject: `${strategy.prefix} ${name}`,
    outreachBody: `${strategy.prefix}\n\nHi [Decision Maker],\n\nI've been tracking ${industry || 'manufacturing'} in ${location || 'your region'} and noticed an opportunity to optimize ${SERVICES[0]}.\n\nWould you be open to a 15-min diagnostic call?\n\nBest,\nHUNTER Intelligence`
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

function requireSupabase(res) {
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.' });
    return false;
  }
  return true;
}

// ─── API ROUTES ──────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      supabase: !!supabase,
      gemini: !!genAI,
      resend: !!resend,
      slack: !!SLACK_WEBHOOK
    }
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    scoringDimensions: SCORING_DIMENSIONS,
    services: SERVICES,
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
  if (!requireSupabase(res)) return;

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
      matched_service: req.body.matchedService || scoredData.recommendedService || SERVICES[0],
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

    const { data, error } = await supabase
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
  if (!requireSupabase(res)) return;

  try {
    const { data, error } = await supabase
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
  if (!requireSupabase(res)) return;

  try {
    const { data, error } = await supabase
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
  if (!requireSupabase(res)) return;

  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      last_activity: new Date().toISOString()
    };
    delete updates.id;

    const { data, error } = await supabase
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
  if (!requireSupabase(res)) return;

  try {
    const { id } = req.params;
    const { error } = await supabase
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
  if (!requireSupabase(res)) return;

  try {
    const { leadId, to, subject, body, strategy } = req.body;

    if (!leadId || !to) {
      return res.status(400).json({ error: 'Lead ID and recipient email are required' });
    }

    if (!resend) {
      return res.status(503).json({ error: 'Resend not configured. Set RESEND_API_KEY.' });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'HUNTER Intelligence <hunter@yourdomain.com>',
      to: [to],
      subject: subject || 'Operational Intelligence Opportunity',
      text: body || 'Hello,\n\nI found an opportunity for your company.\n\nBest,\nHUNTER'
    });

    if (error) throw error;

    const { error: logError } = await supabase
      .from('outreach_logs')
      .insert([{
        lead_id: leadId,
        strategy: strategy || 'A',
        subject: subject || 'Operational Intelligence Opportunity',
        sent_at: new Date().toISOString(),
        status: 'sent'
      }]);

    if (logError) console.error('Log error:', logError);

    await supabase
      .from('leads')
      .update({ stage: 'Outreach Sent', last_activity: new Date().toISOString() })
      .eq('id', leadId);

    res.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/outreach/logs', async (req, res) => {
  if (!requireSupabase(res)) return;

  try {
    const { leadId } = req.query;
    let query = supabase.from('outreach_logs').select('*').order('sent_at', { ascending: false });
    if (leadId) query = query.eq('lead_id', leadId);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  if (!requireSupabase(res)) return;

  try {
    const { data: leads, error } = await supabase
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

// ─── CRON JOBS ──────────────────────────────────────────────

if (supabase) {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily follow-up check...');
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('stage', 'Outreach Sent')
        .lt('last_activity', sevenDaysAgo.toISOString());

      if (error) throw error;

      for (const lead of data) {
        await supabase
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
      const { data: leads } = await supabase.from('leads').select('*');
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

// Serve frontend in production
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 HUNTER Autonomous OS running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
