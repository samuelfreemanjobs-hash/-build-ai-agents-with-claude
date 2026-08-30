import {
  BUSINESS_AUDIENCES,
  BUSINESS_STYLES,
  BUSINESS_TASK_CATALOG,
  BUSINESS_SECTIONS,
  type BusinessTaskDef,
} from './business-prompt-catalog.ts'

export const BUSINESS_GENERATOR_COLLECTION_URL = 'https://github.com/samuelfreemanjobs-hash/-build-ai-agents-with-claude'

export interface GeneratedBusinessRaw {
  title: string
  section: string
  description: string
  content: string
  models: string[]
  type: 'text' | 'image'
  audience: string
  style: string
  baseTask: string
}

function buildPromptContent(
  task: BusinessTaskDef,
  audience: string,
  style: string
): string {
  const steps = task.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const constraints = (task.constraints ?? []).map((c) => `- ${c}`).join('\n')
  const extraConstraints = [
    `- Response style: ${style}`,
    `- Tailor all examples and recommendations for ${audience}`,
    `- Use plain language unless the user specifies otherwise`,
  ].join('\n')

  return `## Role

You are a ${task.role}. You deliver practical, immediately usable business output — not generic theory.

## Context

- Company: {{company-name}}
- Industry: {{industry}}
- Target audience: {{target-audience}}
- Primary goal: {{primary-goal}}
- Audience focus for this session: ${audience}
- Additional details: {{context-details}}

## Task

Create a ${task.deliverable} for the business described above.

Follow these steps in order:

${steps}

## Constraints

${constraints}
${extraConstraints}

## Output Format

${task.outputFormat ?? `Deliver a complete ${task.deliverable} ready to copy into a doc or share with stakeholders.`}

Begin by confirming you understand the context, then produce the full deliverable.`
}

function variantTitle(base: string, audience: string, style: string): string {
  const shortAudience = audience
    .replace('B2B enterprise clients', 'B2B')
    .replace('B2C consumer brands', 'B2C')
    .replace('local service businesses', 'Local')
    .replace('SaaS startups', 'SaaS')
    .replace('agency client accounts', 'Agency')
    .replace('solopreneurs and creators', 'Solopreneur')
  const shortStyle = style
    .replace('detailed and comprehensive', 'Detailed')
    .replace('concise and action-oriented', 'Concise')
    .replace('beginner-friendly with explanations', 'Beginner')
    .replace('expert-level with advanced tactics', 'Expert')
    .replace('executive summary style', 'Executive')
  return `${base} — ${shortAudience} (${shortStyle})`
}

function variantDescription(task: BusinessTaskDef, audience: string, style: string): string {
  const section = BUSINESS_SECTIONS[task.section]?.name ?? task.section
  return `Original ${section.toLowerCase()} prompt that produces a ${task.deliverable}, tailored for ${audience} in a ${style} format. Uses Role/Context/Task structure with fill-in-the-blank variables.`
}

/** Generate all business prompt variants from the catalog */
export function generateBusinessPrompts(options?: {
  audiences?: readonly string[]
  styles?: readonly string[]
  sections?: string[]
  limit?: number
}): GeneratedBusinessRaw[] {
  const audiences = options?.audiences ?? BUSINESS_AUDIENCES
  const styles = options?.styles ?? BUSINESS_STYLES
  const sectionFilter = options?.sections?.length ? new Set(options.sections) : null
  const limit = options?.limit ?? Infinity

  const results: GeneratedBusinessRaw[] = []

  for (const task of BUSINESS_TASK_CATALOG) {
    if (sectionFilter && !sectionFilter.has(task.section)) continue

    for (const audience of audiences) {
      for (const style of styles) {
        if (results.length >= limit) return results

        results.push({
          title: variantTitle(task.title, audience, style),
          section: task.section,
          description: variantDescription(task, audience, style),
          content: buildPromptContent(task, audience, style),
          models: task.models ?? ['ChatGPT', 'Claude', 'Gemini'],
          type: task.type ?? 'text',
          audience,
          style,
          baseTask: task.title,
        })
      }
    }
  }

  return results
}

export function countBusinessPromptVariants(options?: {
  audiences?: readonly string[]
  styles?: readonly string[]
  sections?: string[]
}): number {
  const audiences = options?.audiences ?? BUSINESS_AUDIENCES
  const styles = options?.styles ?? BUSINESS_STYLES
  const sectionFilter = options?.sections?.length ? new Set(options.sections) : null

  let tasks = BUSINESS_TASK_CATALOG.length
  if (sectionFilter) {
    tasks = BUSINESS_TASK_CATALOG.filter((t) => sectionFilter.has(t.section)).length
  }
  return tasks * audiences.length * styles.length
}

export function getBusinessGeneratorStats(): {
  baseTasks: number
  audiences: number
  styles: number
  totalVariants: number
  sections: Record<string, number>
} {
  const sections: Record<string, number> = {}
  for (const t of BUSINESS_TASK_CATALOG) {
    sections[t.section] = (sections[t.section] ?? 0) + 1
  }
  return {
    baseTasks: BUSINESS_TASK_CATALOG.length,
    audiences: BUSINESS_AUDIENCES.length,
    styles: BUSINESS_STYLES.length,
    totalVariants: countBusinessPromptVariants(),
    sections,
  }
}
