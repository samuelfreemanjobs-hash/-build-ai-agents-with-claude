const crypto = require('crypto');
const { SERVICES, RETAINER, DIAGNOSTIC, getServiceById, getServiceByName } = require('./services-catalog');
const { buildProposalPrompt, buildDiagnosticPrompt, parseProposalSections } = require('./proposal-engine');
const { computeBusinessMetrics, buildDailyBriefing } = require('./business-metrics');

function registerBusinessRoutes(app, { store, genAI, resend, sendSlackNotification, requireStore }) {

  app.get('/api/services', (req, res) => {
    res.json({ services: SERVICES, retainer: RETAINER, diagnostic: DIAGNOSTIC });
  });

  app.get('/api/services/:id', (req, res) => {
    const svc = getServiceById(req.params.id);
    if (!svc) return res.status(404).json({ error: 'Service not found' });
    res.json(svc);
  });

  // ─── PROPOSALS ───────────────────────────────────────────────
  app.post('/api/proposals/generate', async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const { leadId, serviceId, includeRetainer } = req.body;
      const { data: lead, error } = await store.from('leads').select('*').eq('id', leadId).single();
      if (error) throw error;

      const service = getServiceById(serviceId) || getServiceByName(lead.matched_service);
      if (!service) return res.status(400).json({ error: 'Service not found' });

      let content;
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = buildProposalPrompt(lead, service, { includeRetainer });
        const result = await model.generateContent(prompt);
        content = result.response.text();
      } else {
        content = buildFallbackProposal(lead, service);
      }

      const parsed = parseProposalSections(content);
      const proposal = {
        id: crypto.randomUUID(),
        lead_id: leadId,
        service_id: service.id,
        title: `Proposal: ${service.name} for ${lead.company}`,
        content,
        investment: service.price,
        status: 'draft',
        created_at: new Date().toISOString()
      };

      const { data, error: insertErr } = await store.from('proposals').insert([proposal]).select();
      if (insertErr) throw insertErr;

      await store.from('leads').update({ stage: 'Proposal Active', last_activity: new Date().toISOString() }).eq('id', leadId);

      res.json({ ...data[0], sections: parsed.sections });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/proposals', async (req, res) => {
    if (!requireStore(res)) return;
    const { data, error } = await store.from('proposals').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/proposals/:id', async (req, res) => {
    if (!requireStore(res)) return;
    const { data, error } = await store.from('proposals').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  });

  // ─── DIAGNOSTICS ─────────────────────────────────────────────
  app.post('/api/diagnostics/generate', async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const { leadId } = req.body;
      const { data: lead, error } = await store.from('leads').select('*').eq('id', leadId).single();
      if (error) throw error;

      let content;
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(buildDiagnosticPrompt(lead));
        content = result.response.text();
      } else {
        content = buildFallbackDiagnostic(lead);
      }

      const frictionMatch = content.match(/FRICTION SCORE[:\s]*(\d+)/i);
      const diagnostic = {
        id: crypto.randomUUID(),
        lead_id: leadId,
        content,
        friction_score: frictionMatch ? parseInt(frictionMatch[1], 10) : null,
        created_at: new Date().toISOString()
      };

      const { data, error: insertErr } = await store.from('diagnostics').insert([diagnostic]).select();
      if (insertErr) throw insertErr;

      await store.from('leads').update({ stage: 'Diagnostic Ready', last_activity: new Date().toISOString() }).eq('id', leadId);

      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/diagnostics', async (req, res) => {
    if (!requireStore(res)) return;
    const { leadId } = req.query;
    let query = store.from('diagnostics').select('*').order('created_at', { ascending: false });
    if (leadId) query = query.eq('lead_id', leadId);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // ─── LEAD CONVERSION ─────────────────────────────────────────
  app.post('/api/leads/:id/convert', async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const { id } = req.params;
      const { serviceId, contactEmail, contactName, contactPhone, startRetainer } = req.body;

      const { data: lead, error } = await store.from('leads').select('*').eq('id', id).single();
      if (error) throw error;

      const service = getServiceById(serviceId) || getServiceByName(lead.matched_service) || SERVICES[0];

      const client = {
        id: crypto.randomUUID(),
        lead_id: id,
        company: lead.company,
        contact_name: contactName || lead.decision_maker,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        industry: lead.industry,
        location: lead.location,
        status: 'active',
        retainer_active: !!startRetainer,
        retainer_amount: startRetainer ? RETAINER.price : 0,
        created_at: new Date().toISOString()
      };

      const project = {
        id: crypto.randomUUID(),
        client_id: client.id,
        lead_id: id,
        name: `${service.name} — ${lead.company}`,
        service_id: service.id,
        status: 'scoping',
        value: service.price,
        start_date: new Date().toISOString().split('T')[0],
        deliverables: service.deliverables,
        created_at: new Date().toISOString()
      };

      const invoice = {
        id: crypto.randomUUID(),
        client_id: client.id,
        project_id: project.id,
        invoice_number: `HUNTER-${Date.now().toString(36).toUpperCase()}`,
        amount: Math.round(service.price * 0.5),
        description: `50% deposit — ${service.name}`,
        status: 'sent',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      await store.from('clients').insert([client]);
      await store.from('projects').insert([project]);
      await store.from('invoices').insert([invoice]);
      await store.from('leads').update({ stage: 'Closed Won / Client', last_activity: new Date().toISOString() }).eq('id', id);

      await sendSlackNotification(`🏆 NEW CLIENT: ${lead.company}\nProject: ${service.name}\nValue: $${service.price.toLocaleString()}\nDeposit invoice: $${invoice.amount.toLocaleString()}`);

      res.json({ client, project, invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ─── CLIENTS / PROJECTS / INVOICES / TASKS ───────────────────
  app.get('/api/clients', async (req, res) => {
    if (!requireStore(res)) return;
    const { data, error } = await store.from('clients').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get('/api/projects', async (req, res) => {
    if (!requireStore(res)) return;
    const { data, error } = await store.from('projects').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/projects/:id', async (req, res) => {
    if (!requireStore(res)) return;
    const updates = { ...req.body };
    if (updates.status === 'completed') updates.completed_at = new Date().toISOString();
    const { data, error } = await store.from('projects').update(updates).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  });

  app.get('/api/invoices', async (req, res) => {
    if (!requireStore(res)) return;
    const { data, error } = await store.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/invoices/:id', async (req, res) => {
    if (!requireStore(res)) return;
    const updates = { ...req.body };
    if (updates.status === 'paid') updates.paid_at = new Date().toISOString();
    const { data, error } = await store.from('invoices').update(updates).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  });

  app.get('/api/tasks', async (req, res) => {
    if (!requireStore(res)) return;
    const { data, error } = await store.from('tasks').select('*').order('due_date', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/tasks', async (req, res) => {
    if (!requireStore(res)) return;
    const task = { id: crypto.randomUUID(), ...req.body, created_at: new Date().toISOString() };
    const { data, error } = await store.from('tasks').insert([task]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  });

  app.put('/api/tasks/:id', async (req, res) => {
    if (!requireStore(res)) return;
    const updates = { ...req.body };
    if (updates.status === 'done') updates.completed_at = new Date().toISOString();
    const { data, error } = await store.from('tasks').update(updates).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  });

  // ─── BUSINESS METRICS & OPERATOR ─────────────────────────────
  app.get('/api/business/metrics', async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const [leads, clients, projects, invoices] = await Promise.all([
        store.from('leads').select('*'),
        store.from('clients').select('*'),
        store.from('projects').select('*'),
        store.from('invoices').select('*')
      ]);
      const metrics = computeBusinessMetrics({
        leads: leads.data || [],
        clients: clients.data || [],
        projects: projects.data || [],
        invoices: invoices.data || []
      });
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/operator/daily', async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const [leads, tasks, clients, projects, invoices] = await Promise.all([
        store.from('leads').select('*').order('score', { ascending: false }),
        store.from('tasks').select('*').neq('status', 'done').order('priority'),
        store.from('clients').select('*'),
        store.from('projects').select('*'),
        store.from('invoices').select('*')
      ]);
      const metrics = computeBusinessMetrics({
        leads: leads.data || [], clients: clients.data || [],
        projects: projects.data || [], invoices: invoices.data || []
      });
      const briefing = buildDailyBriefing(metrics, leads.data || [], tasks.data || []);
      res.json(briefing);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ─── PUBLIC LEAD CAPTURE (landing page) ──────────────────────
  app.post('/api/capture', async (req, res) => {
    try {
      const { company, email, industry, challenge } = req.body;
      if (!company || !email) return res.status(400).json({ error: 'Company and email required' });

      if (requireStore(res) === false) return;

      const lead = await createCapturedLead(store, { company, email, industry, challenge });
      await sendSlackNotification(`📥 NEW INBOUND: ${company}\nEmail: ${email}\nChallenge: ${challenge || 'Not specified'}`);
      res.json({ success: true, leadId: lead.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

async function createCapturedLead(store, { company, email, industry, challenge }) {
  const lead = {
    id: crypto.randomUUID(),
    company,
    location: 'Inbound — TBD',
    industry: industry || 'Industrial Manufacturing',
    decision_maker: email,
    opportunity_title: 'Inbound Lead — Diagnostic Request',
    score: 0,
    tier: 'WATCH',
    stage: 'New Opportunity',
    estimated_value: 25000,
    notes: `Inbound capture. Challenge: ${challenge || 'N/A'}. Email: ${email}`,
    detected_problems: challenge ? [challenge] : ['Inbound inquiry'],
    evidence_signals: 'Landing page form submission',
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  const { data, error } = await store.from('leads').insert([lead]).select();
  if (error) throw error;
  return data[0];
}

function buildFallbackProposal(lead, service) {
  return `# Proposal: ${service.name}\n\n## Executive Summary\n${lead.company} is experiencing operational friction in ${lead.industry || 'manufacturing'}. HUNTER Intelligence proposes the ${service.name} to eliminate manual processes and deliver measurable ROI within 90 days.\n\n## Situation Analysis\n${(lead.detected_problems || ['Manual processes detected']).join('. ')}.\n\n## Proposed Solution\n${service.deliverables.map(d => `- ${d}`).join('\n')}\n\n## Investment\n**${service.name}**: $${service.price.toLocaleString()}\nTimeline: ${service.duration}\n\n## ROI Projection\n${service.roi}\n\n## Next Steps\n1. Sign proposal\n2. 50% deposit ($${Math.round(service.price / 2).toLocaleString()})\n3. Kickoff within 5 business days`;
}

function buildFallbackDiagnostic(lead) {
  return `# Operational Intelligence Diagnostic\n## ${lead.company}\n\n## Friction Score: 72/100\n\n## Top 3 Friction Points\n1. Manual data entry across disconnected spreadsheets\n2. No real-time visibility into production KPIs\n3. Quality data trapped in siloed systems\n\n## Estimated Annual Cost of Inaction: $180,000 – $320,000\n\n## Quick Wins\n1. Consolidate daily production report into one shared dashboard this week\n2. Automate one manual handoff between departments\n\n## Strategic Recommendation\n${lead.matched_service || 'Spreadsheet Elimination System'} — highest ROI for your profile.`;
}

module.exports = { registerBusinessRoutes };
