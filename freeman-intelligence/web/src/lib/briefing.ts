export interface BriefingSubmission {
  name: string
  email: string
  company: string
  phone?: string
  source: string
  diagnostic_score?: number
  submitted_at: string
}

const STORAGE_KEY = 'fi_briefing_submissions'

export function saveBriefing(data: Omit<BriefingSubmission, 'submitted_at'>): BriefingSubmission {
  const submission: BriefingSubmission = { ...data, submitted_at: new Date().toISOString() }
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as BriefingSubmission[]
  existing.push(submission)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

  const webhook = import.meta.env.VITE_BRIEFING_WEBHOOK
  if (webhook) {
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    }).catch(() => {})
  }

  return submission
}
