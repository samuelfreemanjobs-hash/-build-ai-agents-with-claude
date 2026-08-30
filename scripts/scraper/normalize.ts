import {
  CATEGORY_EMOJI,
  CATEGORY_KEYWORDS,
  DEFAULT_MODELS,
  type RawPromptRow,
  type ScrapedPrompt,
} from './types'
import type { AIModel, PromptType } from '../../src/types/prompt'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function normalizePlaceholders(text: string): string {
  return text
    .replace(/\$\{([^}:]+)(?::[^}]*)?\}/g, '{{$1}}')
    .replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, '{{$1}}')
}

export function inferCategories(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const matches: string[] = []

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matches.push(category)
    }
  }

  return matches.length > 0 ? matches.slice(0, 2) : ['productivity']
}

export function inferModels(categories: string[], content: string): AIModel[] {
  const models: AIModel[] = [...DEFAULT_MODELS]
  const text = content.toLowerCase()

  if (categories.includes('coding') || text.includes('code')) {
    models.push('DeepSeek')
  }
  if (!categories.includes('coding') && !categories.includes('image')) {
    models.push('Grok')
  }

  return [...new Set(models)]
}

export function inferType(categories: string[], content: string): PromptType {
  if (categories.includes('image')) return 'image'
  const text = content.toLowerCase()
  if (text.includes('midjourney') || text.includes('stable diffusion') || text.includes('/imagine')) {
    return 'image'
  }
  return 'text'
}

export function generateDescription(title: string, categories: string[]): string {
  const categoryLabel = categories[0]?.replace(/-/g, ' ') ?? 'general'
  return `${title} — a curated ${categoryLabel} prompt for ChatGPT, Claude, and Gemini.`
}

export function generateTags(title: string, categories: string[]): string[] {
  const tags = new Set<string>()
  categories.forEach((c) => tags.add(c))
  title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .forEach((w) => tags.add(w.replace(/[^a-z0-9]/g, '')))
  return [...tags].filter(Boolean).slice(0, 5)
}

export function enhancePromptStructure(title: string, rawContent: string): string {
  const content = normalizePlaceholders(rawContent.trim())

  if (content.includes('## Role') || content.includes('## Task')) {
    return content
  }

  if (content.toLowerCase().startsWith('i want you to act as')) {
    const roleMatch = content.match(/act as (?:an? )?([^.]+)/i)
    const role = roleMatch?.[1]?.trim() ?? title

    return `## Role
You are ${role}.

## Context
Provide any relevant background information or variables using {{placeholders}} where needed.

## Task
${content}

## Output Format
Respond clearly and completely. Follow the instructions above precisely.`
  }

  return `## Role
You are an expert assistant for: ${title}.

## Context
{{context}}

## Task
${content}

## Output Format
Provide a complete, actionable response.`
}

export function normalizeCsvRow(
  row: RawPromptRow,
  source: { name: string; url: string; scrapedAt: string },
  existingIds: Set<string>
): ScrapedPrompt | null {
  const title = row.act?.trim()
  const rawContent = row.prompt?.trim()

  if (!title || !rawContent || rawContent.length < 50) return null

  const categories = inferCategories(title, rawContent)
  const type = inferType(categories, rawContent)
  const models = type === 'image' ? (['Midjourney'] as AIModel[]) : inferModels(categories, rawContent)
  const emoji = CATEGORY_EMOJI[categories[0]] ?? '✨'

  let id = slugify(title)
  let suffix = 2
  while (existingIds.has(id)) {
    id = `${slugify(title).slice(0, 55)}-${suffix++}`
  }
  existingIds.add(id)

  const content = enhancePromptStructure(title, rawContent)

  return {
    id,
    title,
    emoji,
    description: generateDescription(title, categories),
    content,
    categories,
    models,
    type,
    tags: generateTags(title, categories),
    likes: Math.floor(Math.random() * 40) + 5,
    copies: Math.floor(Math.random() * 100) + 10,
    source: {
      name: source.name,
      url: source.url,
      scrapedAt: source.scrapedAt,
    },
  }
}

export function similarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return union === 0 ? 0 : intersection / union
}

export function isDuplicate(newPrompt: ScrapedPrompt, existing: ScrapedPrompt[], threshold = 0.85): boolean {
  return existing.some(
    (p) =>
      p.id === newPrompt.id ||
      similarity(p.content, newPrompt.content) >= threshold ||
      p.title.toLowerCase() === newPrompt.title.toLowerCase()
  )
}
