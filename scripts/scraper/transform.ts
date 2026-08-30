import type { PromptSwipe } from '../../src/types/prompt'

const REWRITE_PATTERNS: Array<[RegExp, string]> = [
  [/I want you to act as (?:an? )?/gi, 'You are a specialist '],
  [/act as (?:an? )?/gi, 'serve as a '],
  [/Please /gi, ''],
  [/Can you /gi, ''],
  [/I need you to /gi, 'Your task is to '],
  [/You will /gi, 'You shall '],
  [/ChatGPT/gi, 'the AI assistant'],
  [/GPT-4/gi, 'an advanced language model'],
]

const FILL_PATTERNS: Array<{ pattern: RegExp; placeholder: string }> = [
  { pattern: /\b(?:my|our|the) (?:company|business|brand|startup|product|service)\b/gi, placeholder: '{{company-name}}' },
  { pattern: /\b(?:target )?audience\b/gi, placeholder: '{{target-audience}}' },
  { pattern: /\b(?:specific )?niche\b/gi, placeholder: '{{niche}}' },
  { pattern: /\b(?:industry|sector)\b/gi, placeholder: '{{industry}}' },
  { pattern: /\b(?:product|service) name\b/gi, placeholder: '{{product-name}}' },
  { pattern: /\b\d+ (?:words|characters|pages|paragraphs)\b/gi, placeholder: '{{length-requirement}}' },
  { pattern: /\b(?:tone|voice|style):?\s*[\w\s]+/gi, placeholder: 'tone: {{brand-tone}}' },
]

export function rewriteForOriginality(content: string, title: string): string {
  let rewritten = content

  for (const [pattern, replacement] of REWRITE_PATTERNS) {
    rewritten = rewritten.replace(pattern, replacement)
  }

  if (!rewritten.includes('## Role')) {
    rewritten = `## Role
You are a dedicated ${title.toLowerCase()} expert who delivers precise, actionable results.

## Context
- Primary goal: {{primary-goal}}
- Audience: {{target-audience}}
- Constraints: {{constraints}}

## Task
${rewritten.trim()}

## Output Format
Structure your response clearly with headings and bullet points where appropriate. Be specific — avoid generic filler.`
  }

  return rewritten.trim()
}

export function generateFillInBlank(content: string): string {
  let result = content

  for (const { pattern, placeholder } of FILL_PATTERNS) {
    if (result.includes(placeholder)) continue
    result = result.replace(pattern, (match) => {
      if (match.includes('{{')) return match
      return placeholder
    })
  }

  if (!result.includes('{{primary-goal}}')) {
    result = result.replace(
      /## Context\n([\s\S]*?)(?=\n## )/,
      `## Context
- Topic: {{topic}}
- Audience: {{target-audience}}
- Goal: {{desired-outcome}}
- Tone: {{brand-tone}}
- Details: {{context-details}}

`
    )
  }

  return result
}

const SWIPE_TEMPLATES = [
  {
    suffix: 'B2B Focus',
    useCase: 'Repurpose for B2B enterprise clients instead of general consumers',
    transform: (title: string, content: string) =>
      content.replace(/## Context[\s\S]*?(?=## Task)/, `## Context
- Target: B2B enterprise decision-makers
- Industry: {{industry}}
- Company size: {{company-size}}
- Pain point: {{primary-pain-point}}
- Desired outcome: {{business-outcome}}

`),
  },
  {
    suffix: 'Quick Version',
    useCase: 'Condensed version for fast results under 5 minutes',
    transform: (_title: string, content: string) =>
      `${content}\n\n## Speed Constraint\nDeliver a concise response in under 300 words. Prioritize the top 3 actionable items only. Skip preamble.`,
  },
  {
    suffix: 'Beginner Friendly',
    useCase: 'Simplified for someone new to this topic with step-by-step guidance',
    transform: (_title: string, content: string) =>
      content.replace(
        /## Output Format[\s\S]*$/,
        `## Output Format
Explain concepts simply as if teaching a beginner. Use numbered steps. Define any jargon. Include one concrete example.`
      ),
  },
]

export function generateSwipes(
  id: string,
  title: string,
  content: string,
  categories: string[]
): PromptSwipe[] {
  const categoryHint = categories[0]?.replace(/-/g, ' ') ?? 'general'

  return SWIPE_TEMPLATES.map((template, i) => ({
    id: `${id}-swipe-${i + 1}`,
    title: `${title} — ${template.suffix}`,
    description: template.useCase,
    useCase: template.useCase,
    content: template.transform(title, content),
  })).concat([
    {
      id: `${id}-swipe-format`,
      title: `${title} — Different Format`,
      description: `Same goal, different output format for ${categoryHint} use cases`,
      useCase: `Convert output to a structured format (checklist, table, or script) for ${categoryHint}`,
      content: content.replace(
        /## Output Format[\s\S]*$/,
        `## Output Format
Deliver the response as a structured {{output-format}} (choose: checklist | comparison table | step-by-step script | FAQ).
Include a one-line summary at the top.`
      ),
    },
  ])
}

export function generateUniqueTitle(title: string): string {
  const prefixes = ['Smart', 'Pro', 'Guided', 'Expert', 'Rapid']
  const hash = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const prefix = prefixes[hash % prefixes.length]
  if (title.startsWith(prefix)) return title
  return `${prefix} ${title}`
}

export function generateUniqueDescription(title: string, sectionName: string): string {
  return `An original ${sectionName.toLowerCase()} workflow prompt inspired by the 1000+ Prompts collection — rewritten for ${title.toLowerCase()} tasks. Includes swipes and fill-in-the-blank versions.`
}
