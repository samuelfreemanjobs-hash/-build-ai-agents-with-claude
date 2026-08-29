const crypto = require('crypto');
const { STRATEGIES } = require('./services-catalog');

const OUTREACH_STAGES = ['New Opportunity', 'Diagnostic Ready'];
const BATCH_DELAY_MS = 1500;

function extractEmail(lead) {
  const dm = lead.decision_maker || '';
  if (dm.includes('@')) return dm.trim();
  const notes = lead.notes || '';
  const match = notes.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return match ? match[0] : null;
}

function personalizeText(text, lead) {
  const bookingUrl = process.env.BOOKING_URL || '';
  const dm = lead.decision_maker || 'there';
  const firstName = dm.includes('@') ? dm.split('@')[0].split(/[._]/)[0] : dm.split(' ')[0];

  return String(text || '')
    .replace(/\[BOOKING_URL\]/g, bookingUrl || 'reply to schedule')
    .replace(/\[Decision Maker\]/gi, firstName === 'there' ? 'there' : firstName.charAt(0).toUpperCase() + firstName.slice(1))
    .replace(/\[Company\]/g, lead.company || '')
    .replace(/\[Industry\]/g, lead.industry || 'manufacturing')
    .replace(/\[Location\]/g, lead.location || 'your region');
}

function getBatchCandidates(leads, options = {}) {
  const { tier, tiers, leadIds, max = 25 } = options;
  const tierList = tiers || (tier ? [tier] : ['HOT', 'HIGH']);
  const excludeStages = ['Outreach Sent', 'Meeting Booked', 'Proposal Active', 'Closed Won / Client'];

  let filtered = leads.filter(l => {
    if (leadIds?.length) return leadIds.includes(l.id);
    if (!tierList.includes(l.tier)) return false;
    if (excludeStages.includes(l.stage)) return false;
    return !!extractEmail(l);
  });

  filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  return filtered.slice(0, max);
}

async function sendOutreachEmail({ store, resend, lead, to, subject, body, strategy, dryRun = false }) {
  if (!to) throw new Error(`No email for ${lead.company}`);
  if (!resend && !dryRun) throw new Error('Resend not configured. Set RESEND_API_KEY.');

  const finalSubject = personalizeText(subject || lead.outreach_subject, lead);
  const finalBody = personalizeText(body || lead.outreach_body, lead);
  const finalStrategy = strategy || lead.outreach_strategy || 'A';

  if (dryRun) {
    return {
      dryRun: true,
      leadId: lead.id,
      company: lead.company,
      to,
      subject: finalSubject,
      body: finalBody,
      strategy: finalStrategy
    };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM || 'HUNTER Intelligence <hunter@yourdomain.com>',
    to: [to],
    subject: finalSubject,
    text: finalBody,
    tags: [
      { name: 'lead_id', value: lead.id },
      { name: 'company', value: lead.company.slice(0, 50) }
    ]
  });

  if (error) throw error;

  const logEntry = {
    id: crypto.randomUUID(),
    lead_id: lead.id,
    strategy: finalStrategy,
    subject: finalSubject,
    recipient: to,
    resend_message_id: data?.id || null,
    sent_at: new Date().toISOString(),
    status: 'sent',
    open_count: 0,
    click_count: 0,
    follow_up_paused: false
  };

  await store.from('outreach_logs').insert([logEntry]);

  await store.from('leads').update({
    stage: 'Outreach Sent',
    outreach_subject: finalSubject,
    outreach_body: finalBody,
    outreach_strategy: finalStrategy,
    last_activity: new Date().toISOString(),
    notes: `${lead.notes || ''}\n[${new Date().toISOString()}] Outreach sent to ${to}.`.trim()
  }).eq('id', lead.id);

  return {
    success: true,
    leadId: lead.id,
    company: lead.company,
    to,
    messageId: data?.id,
    subject: finalSubject
  };
}

async function sendBatchOutreach({ store, resend, leads, options = {} }) {
  const candidates = getBatchCandidates(leads, options);
  const results = { sent: [], skipped: [], failed: [], dryRun: !!options.dryRun };

  for (const lead of candidates) {
    const to = extractEmail(lead);
    if (!to) {
      results.skipped.push({ company: lead.company, reason: 'No email address' });
      continue;
    }

    try {
      const result = await sendOutreachEmail({
        store, resend, lead, to,
        subject: lead.outreach_subject,
        body: lead.outreach_body,
        strategy: lead.outreach_strategy,
        dryRun: options.dryRun
      });
      results.sent.push(result);
      if (!options.dryRun) await sleep(BATCH_DELAY_MS);
    } catch (e) {
      results.failed.push({ company: lead.company, error: e.message });
    }
  }

  return { ...results, total: candidates.length };
}

async function findLogByMessageId(store, messageId) {
  const { data: logs } = await store.from('outreach_logs').select('*');
  return (logs || []).find(l => l.resend_message_id === messageId) || null;
}

async function handleResendEvent(event, { store, sendSlackNotification, getLeadById }) {
  const type = event.type;
  const data = event.data || {};
  const messageId = data.email_id || data.id;

  if (!messageId) return { handled: false, reason: 'No message ID' };

  let log = await findLogByMessageId(store, messageId);
  let lead = null;

  if (!log && data.tags?.lead_id) {
    const leadId = data.tags.lead_id;
    lead = await getLeadById(leadId);
  } else if (log) {
    lead = await getLeadById(log.lead_id);
  }

  if (!lead && !log) return { handled: false, reason: 'No matching lead/log' };

  const leadId = log?.lead_id || lead?.id;
  if (!lead) {
    const { data: l } = await store.from('leads').select('*').eq('id', leadId).single();
    lead = l;
  }

  const company = lead?.company || 'Unknown';
  const now = new Date().toISOString();
  let newStatus = log?.status || 'sent';
  let newStage = lead?.stage;
  let slackMessage = null;

  const updates = { last_activity: now };
  const logUpdates = {};

  switch (type) {
    case 'email.delivered':
      newStatus = 'delivered';
      break;

    case 'email.opened':
      newStatus = 'opened';
      logUpdates.open_count = (log?.open_count || 0) + 1;
      logUpdates.opened_at = log?.opened_at || now;
      if ((log?.open_count || 0) + 1 >= 2 && lead?.stage === 'Outreach Sent') {
        newStage = 'Diagnostic Ready';
        slackMessage = `👀 *${company}* opened your email ${(log?.open_count || 0) + 1}x — moved to Diagnostic Ready`;
      } else if ((log?.open_count || 0) === 0) {
        slackMessage = `👀 *${company}* opened your outreach email`;
      }
      break;

    case 'email.clicked':
      newStatus = 'clicked';
      logUpdates.click_count = (log?.click_count || 0) + 1;
      logUpdates.clicked_at = now;
      logUpdates.follow_up_paused = true;
      if (['New Opportunity', 'Outreach Sent', 'Diagnostic Ready'].includes(lead?.stage)) {
        newStage = 'Diagnostic Ready';
      }
      slackMessage = `🎯 *${company}* clicked a link in your email — high intent! Stage → Diagnostic Ready`;
      break;

    case 'email.bounced':
      newStatus = 'bounced';
      updates.notes = `${lead?.notes || ''}\n[${now}] Email bounced for ${data.to || 'recipient'}.`.trim();
      slackMessage = `⚠️ Email bounced for *${company}*`;
      break;

    case 'email.complained':
      newStatus = 'bounced';
      slackMessage = `🚫 Spam complaint from *${company}* — remove from outreach`;
      break;

    default:
      return { handled: false, reason: `Unhandled type: ${type}` };
  }

  if (log) {
    await store.from('outreach_logs').update({
      status: newStatus,
      ...logUpdates
    }).eq('id', log.id);
  } else if (leadId) {
    await store.from('outreach_logs').insert([{
      id: crypto.randomUUID(),
      lead_id: leadId,
      subject: data.subject || 'Outreach',
      resend_message_id: messageId,
      sent_at: now,
      status: newStatus,
      open_count: type === 'email.opened' ? 1 : 0,
      click_count: type === 'email.clicked' ? 1 : 0,
      opened_at: type === 'email.opened' ? now : null,
      clicked_at: type === 'email.clicked' ? now : null,
      follow_up_paused: type === 'email.clicked'
    }]);
  }

  if (newStage && newStage !== lead?.stage) {
    updates.stage = newStage;
  }

  if (leadId && Object.keys(updates).length > 1) {
    await store.from('leads').update(updates).eq('id', leadId);
  }

  if (slackMessage && sendSlackNotification) {
    await sendSlackNotification(slackMessage);
  }

  return { handled: true, type, company, newStatus, newStage };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = {
  extractEmail,
  personalizeText,
  getBatchCandidates,
  sendOutreachEmail,
  sendBatchOutreach,
  handleResendEvent,
  BATCH_DELAY_MS
};
