export interface DiagnosticResult {
  revenue_intelligence_score: number
  maturity_band: string
  area_scores: Record<string, number>
  top_opportunities: Array<{ area: string; title: string; impact: string; description: string }>
  top_bottlenecks: Array<{ area: string; description: string }>
  ai_automation_opportunities: Array<{ area: string; opportunity: string }>
  data_reporting_gaps: Array<{ area: string; gap: string }>
  recommended_first_project: { name: string; product: string }
  context: { industry: string; company_size: string; icp_tier?: number }
}

const OPPORTUNITY_TEMPLATES: Record<string, { title: string; impact: string; description: string }> = {
  leads: { title: 'Lead generation systematization', impact: 'high', description: 'Implement targeted lead capture, qualification scoring, and automated nurture.' },
  sales: { title: 'Sales process optimization', impact: 'high', description: 'Define stage gates, win/loss analysis, and pipeline forecasting.' },
  followup: { title: 'Follow-up automation', impact: 'critical', description: 'Deploy instant response workflows and SLA tracking.' },
  quoting: { title: 'Quoting acceleration', impact: 'critical', description: 'Reduce quote turnaround with templates and AI-assisted proposals.' },
  operations: { title: 'Sales-to-ops handoff', impact: 'high', description: 'Connect sales commitments to operational delivery.' },
  reporting: { title: 'Executive revenue dashboard', impact: 'medium', description: 'Build real-time KPI dashboards replacing manual reporting.' },
  retention: { title: 'Customer expansion program', impact: 'high', description: 'Implement churn signals and renewal workflows.' },
  data: { title: 'Data integration layer', impact: 'critical', description: 'Connect CRM, ERP, and operational systems.' },
  automation: { title: 'AI automation pilot', impact: 'high', description: 'Identify 2-3 high-ROI processes for AI automation.' },
}

const BOTTLENECKS: Record<string, string> = {
  leads: 'Inconsistent lead flow creates feast-or-famine revenue cycles',
  sales: 'Unpredictable pipeline makes forecasting unreliable',
  followup: 'Delayed follow-up loses deals to faster competitors',
  quoting: 'Slow quoting extends sales cycles and reduces win rates',
  operations: 'Sales promises outpace operational capacity',
  reporting: 'Leadership makes decisions on stale data',
  retention: 'Customer churn erodes revenue base',
  data: 'Teams waste hours reconciling disconnected systems',
  automation: 'Manual processes consume capacity that should drive revenue',
}

const AI_MAP: Record<string, string> = {
  followup: 'AI email triage and instant response drafting',
  quoting: 'AI-assisted RFP analysis and proposal generation',
  reporting: 'AI-generated executive briefings from live data',
  data: 'AI data extraction and normalization across systems',
  automation: 'AI agent workflows for repetitive tasks',
  operations: 'AI-powered exception detection and escalation',
}

const DATA_GAPS: Record<string, string> = {
  reporting: 'No single source of truth for revenue KPIs',
  data: 'CRM and ERP data not synchronized',
  sales: 'Pipeline data incomplete or inconsistently entered',
  operations: 'Operational metrics not linked to revenue outcomes',
}

const INDUSTRY_BONUS: Record<string, string> = {
  automotive: 'OTIF and routing guide compliance automation',
  logistics: 'RFP response acceleration and carrier intelligence',
  manufacturing: 'Production-to-revenue visibility dashboard',
}

const PROJECT_MAP = [
  { condition: 'quoting', threshold: 3, project: 'Revenue Intelligence Audit + Quoting Acceleration Pilot', product: 'revenue-intelligence-audit' },
  { condition: 'data', threshold: 3, project: 'Data Integration + Executive Dashboard', product: 'revenue-systems-engineering' },
  { condition: 'followup', threshold: 3, project: 'Follow-up Automation + CRM Workflow', product: 'revenue-systems-engineering' },
  { condition: 'automation', threshold: 3, project: 'AI Opportunity Assessment + Pilot Agent', product: 'revenue-systems-engineering' },
  { condition: 'default', project: 'Revenue Intelligence Audit', product: 'revenue-intelligence-audit' },
]

export function scoreDiagnostic(
  responses: Record<string, number>,
  industry: string,
  companySize: string,
): DiagnosticResult {
  const areaScores = { ...responses }
  const values = Object.values(areaScores)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const intelligenceScore = Math.round(avg * 20)

  const ranked = Object.entries(areaScores).sort(([, a], [, b]) => a - b)
  const weakest = ranked.slice(0, 3).map(([area]) => area)

  const opportunities = weakest
    .filter((area) => OPPORTUNITY_TEMPLATES[area])
    .map((area) => ({ area, ...OPPORTUNITY_TEMPLATES[area] }))

  if (INDUSTRY_BONUS[industry]) {
    opportunities.push({
      area: 'industry_specific',
      title: INDUSTRY_BONUS[industry],
      impact: 'high',
      description: `Metro Detroit ${industry} sector opportunity based on ICP fit.`,
    })
  }

  const bottlenecks = weakest.map((area) => ({ area, description: BOTTLENECKS[area] || '' }))

  const aiOpportunities = Object.entries(areaScores)
    .filter(([area, score]) => score <= 3 && AI_MAP[area])
    .map(([area]) => ({ area, opportunity: AI_MAP[area] }))
    .slice(0, 4)

  const dataGaps = Object.entries(areaScores)
    .filter(([area, score]) => score <= 3 && DATA_GAPS[area])
    .map(([area]) => ({ area, gap: DATA_GAPS[area] }))
    .slice(0, 3)

  let recommended = PROJECT_MAP[PROJECT_MAP.length - 1]
  for (const rule of PROJECT_MAP) {
    if (rule.condition === 'default') continue
    const threshold = rule.threshold ?? 3
    if ((areaScores[rule.condition] ?? 5) <= threshold) {
      recommended = rule
      break
    }
  }

  let maturityBand = 'critical'
  if (intelligenceScore >= 80) maturityBand = 'advanced'
  else if (intelligenceScore >= 60) maturityBand = 'established'
  else if (intelligenceScore >= 40) maturityBand = 'developing'

  const icpTier = industry === 'automotive' ? 1 : industry === 'manufacturing' ? 2 : industry === 'logistics' ? 3 : undefined

  return {
    revenue_intelligence_score: intelligenceScore,
    maturity_band: maturityBand,
    area_scores: areaScores,
    top_opportunities: opportunities.slice(0, 3),
    top_bottlenecks: bottlenecks,
    ai_automation_opportunities: aiOpportunities,
    data_reporting_gaps: dataGaps,
    recommended_first_project: { name: recommended.project, product: recommended.product },
    context: { industry, company_size: companySize, icp_tier: icpTier },
  }
}
