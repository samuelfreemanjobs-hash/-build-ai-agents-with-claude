function computeBusinessMetrics({ leads = [], clients = [], projects = [], invoices = [] }) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const won = leads.filter(l => l.stage === 'Closed Won / Client');
  const active = leads.filter(l => l.stage !== 'Closed Won / Client');
  const hot = leads.filter(l => l.tier === 'HOT' || l.score >= 90);
  const proposal = leads.filter(l => l.stage === 'Proposal Active');
  const meetings = leads.filter(l => l.stage === 'Meeting Booked');

  const pipelineValue = active.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const weightedPipeline = active.reduce((s, l) => {
    const weight = { 'Proposal Active': 0.6, 'Meeting Booked': 0.4, 'Diagnostic Ready': 0.25, 'Outreach Sent': 0.1, 'New Opportunity': 0.05 }[l.stage] || 0.05;
    return s + (l.estimated_value || 0) * weight;
  }, 0);

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const revenueThisMonth = paidInvoices
    .filter(i => {
      const d = new Date(i.paid_at || i.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((s, i) => s + (i.amount || 0), 0);

  const revenueYTD = paidInvoices
    .filter(i => new Date(i.paid_at || i.created_at).getFullYear() === thisYear)
    .reduce((s, i) => s + (i.amount || 0), 0);

  const mrr = clients
    .filter(c => c.retainer_active)
    .reduce((s, c) => s + (c.retainer_amount || 4500), 0);

  const outstandingAR = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const overdueAR = overdueInvoices.reduce((s, i) => s + (i.amount || 0), 0);

  const activeClients = clients.filter(c => c.status === 'active').length;
  const targetMonthly = parseInt(process.env.REVENUE_TARGET_MONTHLY || '50000', 10);
  const targetAnnual = targetMonthly * 12;

  return {
    pipeline: {
      total: leads.length,
      active: active.length,
      hot: hot.length,
      proposals: proposal.length,
      meetings: meetings.length,
      value: pipelineValue,
      weightedValue: Math.round(weightedPipeline),
      winRate: won.length / (won.length + active.length) * 100 || 0
    },
    revenue: {
      thisMonth: revenueThisMonth,
      ytd: revenueYTD,
      mrr,
      outstanding: outstandingAR,
      overdue: overdueAR,
      targetMonthly,
      targetAnnual,
      progressToTarget: Math.round((revenueThisMonth / targetMonthly) * 100)
    },
    delivery: {
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      activeClients,
      totalClients: clients.length
    },
    health: {
      score: computeHealthScore({ hot: hot.length, proposals: proposal.length, mrr, revenueThisMonth, targetMonthly, overdueAR }),
      alerts: buildAlerts({ hot, overdueInvoices, proposal, meetings, revenueThisMonth, targetMonthly })
    }
  };
}

function computeHealthScore({ hot, proposals, mrr, revenueThisMonth, targetMonthly, overdueAR }) {
  let score = 50;
  if (hot >= 3) score += 15;
  if (proposals >= 2) score += 15;
  if (mrr >= 9000) score += 10;
  if (revenueThisMonth >= targetMonthly * 0.5) score += 10;
  if (overdueAR > 0) score -= 15;
  return Math.min(100, Math.max(0, score));
}

function buildAlerts({ hot, overdueInvoices, proposal, meetings, revenueThisMonth, targetMonthly }) {
  const alerts = [];
  if (hot.length > 0) alerts.push({ type: 'opportunity', message: `${hot.length} HOT lead(s) need immediate outreach`, priority: 'high' });
  if (proposal.length > 0) alerts.push({ type: 'action', message: `${proposal.length} active proposal(s) — follow up today`, priority: 'high' });
  if (meetings.length > 0) alerts.push({ type: 'calendar', message: `${meetings.length} meeting(s) booked — prep diagnostics`, priority: 'medium' });
  if (overdueInvoices.length > 0) alerts.push({ type: 'finance', message: `${overdueInvoices.length} overdue invoice(s) — collect now`, priority: 'critical' });
  if (revenueThisMonth < targetMonthly * 0.25) alerts.push({ type: 'revenue', message: 'Revenue below 25% of monthly target — increase outreach volume', priority: 'medium' });
  return alerts;
}

function buildDailyBriefing(metrics, leads, tasks) {
  const hot = leads.filter(l => l.tier === 'HOT').slice(0, 5);
  const dueTasks = (tasks || []).filter(t => t.status !== 'done').slice(0, 8);
  const staleLeads = leads.filter(l => {
    const days = (Date.now() - new Date(l.last_activity).getTime()) / 86400000;
    return days > 5 && !['Closed Won / Client'].includes(l.stage);
  }).slice(0, 5);

  return {
    date: new Date().toISOString().split('T')[0],
    greeting: getGreeting(),
    metrics: metrics.health,
    priorities: [
      ...metrics.health.alerts.map(a => ({ type: 'alert', ...a })),
      ...hot.map(l => ({ type: 'hot_lead', company: l.company, score: l.score, action: 'Send personalized outreach today' })),
      ...staleLeads.map(l => ({ type: 'stale', company: l.company, stage: l.stage, action: 'Follow up or disqualify' }))
    ].slice(0, 10),
    tasks: dueTasks,
    revenue: metrics.revenue,
    pipeline: metrics.pipeline
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning, Operator.';
  if (h < 17) return 'Good afternoon, Operator.';
  return 'Good evening, Operator.';
}

module.exports = { computeBusinessMetrics, buildDailyBriefing };
