export interface ProcessInput {
  id: string
  hours_per_week: number
  automation_readiness: number // 1-5
}

export interface ProcessDefinition {
  id: string
  label: string
  description: string
  ai_fit: number // 0-1 base fit score
  hourly_value: number
}

export const PROCESSES: ProcessDefinition[] = [
  { id: 'rfp_quoting', label: 'RFP / Quoting', description: 'Proposal and quote preparation', ai_fit: 0.92, hourly_value: 85 },
  { id: 'followup', label: 'Lead follow-up', description: 'Inquiry response and nurture emails', ai_fit: 0.88, hourly_value: 70 },
  { id: 'reporting', label: 'Executive reporting', description: 'KPI compilation and briefing prep', ai_fit: 0.85, hourly_value: 75 },
  { id: 'data_entry', label: 'Data entry / sync', description: 'CRM, ERP, spreadsheet reconciliation', ai_fit: 0.9, hourly_value: 55 },
  { id: 'scheduling', label: 'Scheduling / coordination', description: 'Appointments, dock slots, meetings', ai_fit: 0.78, hourly_value: 60 },
  { id: 'compliance', label: 'Compliance checks', description: 'Routing guide, cert, OTIF validation', ai_fit: 0.82, hourly_value: 80 },
  { id: 'customer_comms', label: 'Customer communications', description: 'Status updates, chase emails, briefs', ai_fit: 0.8, hourly_value: 65 },
]

export interface AIMapResult {
  opportunities: Array<{
    process: string
    label: string
    annual_hours_saved: number
    annual_value: number
    impact_score: number
    recommendation: string
  }>
  total_annual_value: number
  top_recommendation: string
}

export function mapAIOpportunities(inputs: ProcessInput[]): AIMapResult {
  const opportunities = inputs
    .filter((p) => p.hours_per_week > 0)
    .map((input) => {
      const def = PROCESSES.find((p) => p.id === input.id)
      if (!def) return null
      const automationFactor = (input.automation_readiness / 5) * def.ai_fit
      const hoursSaved = input.hours_per_week * 52 * automationFactor * 0.6
      const annualValue = Math.round(hoursSaved * def.hourly_value)
      const impactScore = Math.round(automationFactor * input.hours_per_week * 20)
      return {
        process: input.id,
        label: def.label,
        annual_hours_saved: Math.round(hoursSaved),
        annual_value: annualValue,
        impact_score: impactScore,
        recommendation: impactScore >= 70
          ? `Deploy AI agent for ${def.label.toLowerCase()} — high ROI, strong automation fit`
          : impactScore >= 40
            ? `Pilot workflow automation for ${def.label.toLowerCase()} — moderate fit, validate with audit`
            : `Manual optimization first — AI fit lower for ${def.label.toLowerCase()}`,
      }
    })
    .filter((o): o is NonNullable<typeof o> => o !== null)
    .sort((a, b) => b.impact_score - a.impact_score)

  const totalValue = opportunities.reduce((s, o) => s + o.annual_value, 0)

  return {
    opportunities,
    total_annual_value: totalValue,
    top_recommendation: opportunities[0]?.recommendation ?? 'Complete the Revenue Opportunity Diagnostic for personalized recommendations',
  }
}
