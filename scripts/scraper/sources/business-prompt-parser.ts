import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueTitle,
} from '../transform.ts'
import { slugify, inferCategories, inferType, generateTags } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'
import {
  BUSINESS_GENERATOR_COLLECTION_URL,
  generateBusinessPrompts,
  getBusinessGeneratorStats,
  type GeneratedBusinessRaw,
} from './business-prompt-generator.ts'
import { BUSINESS_SECTIONS } from './business-prompt-catalog.ts'

export const BUSINESS_GENERATOR_COLLECTION = {
  id: 'business-generated',
  name: 'Business Prompt Generator',
  sourceUrl: BUSINESS_GENERATOR_COLLECTION_URL,
}

function variantKey(p: GeneratedBusinessRaw): string {
  return `${p.baseTask}|${p.audience}|${p.style}`.toLowerCase()
}

function dedupeRaw(prompts: GeneratedBusinessRaw[]): GeneratedBusinessRaw[] {
  const seen = new Set<string>()
  const out: GeneratedBusinessRaw[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 100) continue
    const key = variantKey(p)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

export function importGeneratedBusinessPrompts(
  rawPrompts: GeneratedBusinessRaw[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: BUSINESS_GENERATOR_COLLECTION.name,
    url: BUSINESS_GENERATOR_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section
    let id = slugify(`bizgen-${sectionId}-${item.baseTask}-${item.audience.slice(0, 12)}-${item.style.slice(0, 8)}`)

    const section = BUSINESS_SECTIONS[sectionId] ?? { name: sectionId, emoji: '💼', categoryIds: ['business'], defaultRole: '' }
    const uniqueTitle = generateUniqueTitle(item.title)
    const content = item.content
    const categories = inferCategories(uniqueTitle, content)
    const type = inferType([...section.categoryIds, ...categories], content)

    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(`bizgen-${item.baseTask}-${item.audience}`).slice(0, 40)}-bg-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(content)
    const swipes = generateSwipes(id, uniqueTitle, content, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '💼',
      description: item.description,
      content,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: item.models as import('../../src/types/prompt').AIModel[],
      type: item.type ?? type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'business-generated',
          'original',
          'structured-prompt',
          'swipe-ready',
          item.audience.split(' ')[0].toLowerCase(),
        ]),
      ],
      likes: Math.floor(Math.random() * 30) + 10,
      copies: Math.floor(Math.random() * 80) + 15,
      collection: BUSINESS_GENERATOR_COLLECTION.id,
      collectionSection: sectionId,
      source: sourceMeta,
    }

    results.push(prompt)
  }

  return results
}

export async function scrapeBusinessPromptGenerator(options: {
  existingPrompts?: ScrapedPrompt[]
  limit?: number
  sections?: string[]
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const stats = getBusinessGeneratorStats()
  const raw = generateBusinessPrompts({
    sections: options.sections,
    limit: options.limit ?? Infinity,
  })

  const message = `Generated ${raw.length} original business prompts (${stats.baseTasks} base tasks × ${stats.audiences} audiences × ${stats.styles} styles = ${stats.totalVariants} possible variants)`
  console.log(`  ${message}`)

  const deduped = dedupeRaw(raw)
  const prompts = importGeneratedBusinessPrompts(deduped, options.existingPrompts ?? [], options.limit ?? Infinity)

  return { prompts, method: 'generated', message }
}

export { getBusinessGeneratorStats, generateBusinessPrompts }
