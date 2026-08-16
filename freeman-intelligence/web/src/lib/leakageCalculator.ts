export interface LeakageInputs {
  annual_revenue: number
  industry: string
  slow_followup_pct: number
  manual_reporting_hours: number
  quote_delay_days: number
  data_reconciliation_hours: number
  missed_upsell_pct: number
}

export interface LeakageResult {
  total_annual_leakage: number
  leakage_pct: number
  breakdown: Array<{ category: string; amount: number; description: string }>
  recovery_potential: number
  recommended_action: string
}

const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  automotive: 1.15,
  logistics: 1.1,
  manufacturing: 1.05,
  other: 1.0,
}

export function calculateLeakage(inputs: LeakageInputs): LeakageResult {
  const rev = inputs.annual_revenue
  const mult = INDUSTRY_MULTIPLIERS[inputs.industry] ?? 1.0

  const followupLoss = rev * (inputs.slow_followup_pct / 100) * 0.35 * mult
  const reportingCost = inputs.manual_reporting_hours * 52 * 75 * mult
  const quoteLoss = rev * (inputs.quote_delay_days / 30) * 0.02 * mult
  const dataCost = inputs.data_reconciliation_hours * 52 * 65 * mult
  const upsellLoss = rev * (inputs.missed_upsell_pct / 100) * 0.08 * mult

  const breakdown = [
    { category: 'Slow follow-up', amount: Math.round(followupLoss), description: 'Lost deals from delayed response to inquiries and RFQs' },
    { category: 'Manual reporting', amount: Math.round(reportingCost), description: 'Labor cost of spreadsheet-based reporting and reconciliation' },
    { category: 'Quote delays', amount: Math.round(quoteLoss), description: 'Revenue impact of extended quoting cycles' },
    { category: 'Data reconciliation', amount: Math.round(dataCost), description: 'Hours spent moving data between disconnected systems' },
    { category: 'Missed upsells', amount: Math.round(upsellLoss), description: 'Expansion revenue left on the table from existing customers' },
  ].sort((a, b) => b.amount - a.amount)

  const total = breakdown.reduce((sum, b) => sum + b.amount, 0)
  const leakagePct = rev > 0 ? Math.round((total / rev) * 1000) / 10 : 0
  const recovery = Math.round(total * 0.45)

  let action = 'Revenue Intelligence Audit'
  if (breakdown[0]?.category === 'Slow follow-up' || breakdown[0]?.category === 'Quote delays') {
    action = 'Quoting & Follow-up Automation Pilot'
  } else if (breakdown[0]?.category === 'Data reconciliation' || breakdown[0]?.category === 'Manual reporting') {
    action = 'Data Integration + Executive Dashboard'
  }

  return {
    total_annual_leakage: total,
    leakage_pct: leakagePct,
    breakdown,
    recovery_potential: recovery,
    recommended_action: action,
  }
}
