import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueTitle,
  rewriteForOriginality,
} from '../transform.ts'
import { slugify, inferCategories, inferModels, inferType, generateTags, similarity, normalizePlaceholders } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'
import {
  MOREUSEFULTHINGS_LIBRARY_URL,
  MOREUSEFULTHINGS_CACHE_FILE,
  fetchMoreUsefulThingsLibrary,
  parseMicrosoftPromptMd,
  parseSimulationCreatorMd,
  type MoreUsefulThingsRaw,
} from './moreusefulthings-fetch.ts'

export const MOREUSEFULTHINGS_COLLECTION = {
  id: 'moreusefulthings',
  name: 'More Useful Things',
  sourceUrl: MOREUSEFULTHINGS_LIBRARY_URL,
}

export const MOREUSEFULTHINGS_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  'instructor-aids': { name: 'Instructor Aids', emoji: '👩‍🏫', categoryIds: ['education'] },
  'student-exercises': { name: 'Student Exercises', emoji: '🎓', categoryIds: ['education'] },
  other: { name: 'Other Prompts', emoji: '📚', categoryIds: ['education', 'business'] },
}

function bracketToMustache(text: string): string {
  return normalizePlaceholders(
    text.replace(/\{\{([^}]+)\}\}/g, '{{$1}}').replace(/\[([^\]]+)\]/g, (_m, inner) => {
      const key = inner
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 45)
      return `{{${key || 'placeholder'}}}`
    })
  )
}

function loadCachedRawPrompts(): MoreUsefulThingsRaw[] {
  const cached = resolve(MOREUSEFULTHINGS_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as MoreUsefulThingsRaw[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: MoreUsefulThingsRaw[]): MoreUsefulThingsRaw[] {
  const out: MoreUsefulThingsRaw[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importMoreUsefulThingsPrompts(
  rawPrompts: MoreUsefulThingsRaw[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: MOREUSEFULTHINGS_COLLECTION.name,
    url: MOREUSEFULTHINGS_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'other'
    const section = MOREUSEFULTHINGS_SECTIONS[sectionId] ?? MOREUSEFULTHINGS_SECTIONS.other
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const structured = item.description
      ? `## Use Case\n${item.description}\n\n## Prompt\n${normalized}`
      : normalized
    const rewritten = rewriteForOriginality(structured, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...section.categoryIds, ...categories], rewritten)
    const models =
      item.models?.length
        ? (item.models.filter((m) =>
            ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney'].includes(m)
          ) as import('../../src/types/prompt').AIModel[])
        : [...inferModels(categories, rewritten)]

    let id = slugify(`mut-${sectionId}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-mut-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '📚',
      description:
        item.description ??
        `Educational prompt from Ethan & Lilach Mollick (More Useful Things) — ${section.name}. CC BY 4.0. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: models.length ? models : ['ChatGPT', 'Claude', 'Gemini'],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'moreusefulthings',
          'mollick',
          'education',
          'swipe-ready',
        ]),
      ],
      likes: Math.floor(Math.random() * 50) + 20,
      copies: Math.floor(Math.random() * 150) + 30,
      collection: MOREUSEFULTHINGS_COLLECTION.id,
      collectionSection: sectionId,
      source: {
        ...sourceMeta,
        url: item.sourceUrl ?? sourceMeta.url,
      },
    }

    // Dedupe against all collections (overlap with Wharton GAIL seed)
    if (
      [...existingPrompts, ...results].some(
        (p) =>
          p.id === prompt.id ||
          similarity(p.content, prompt.content) >= 0.95
      )
    ) {
      continue
    }

    results.push(prompt)
  }

  return results
}

export async function scrapeMoreUsefulThingsLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const fetchResult = await fetchMoreUsefulThingsLibrary(options.live ?? false)
  let raw = fetchResult.prompts
  let method = fetchResult.method
  let message = fetchResult.message

  if (!raw.length) {
    raw = loadCachedRawPrompts()
    if (raw.length) {
      method = 'cached'
      message = `Loaded ${raw.length} prompts from cache`
    }
  }

  console.log(`  ${message || `Found ${raw.length} raw prompts`}`)
  raw = dedupeRaw(raw)
  const prompts = importMoreUsefulThingsPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseMoreUsefulThingsFromFile(filePath: string, section = 'other'): MoreUsefulThingsRaw[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as MoreUsefulThingsRaw[]
  }
  if (path.toLowerCase().includes('simulation')) {
    const sim = parseSimulationCreatorMd(raw)
    return sim ? [sim] : []
  }
  const parsed = parseMicrosoftPromptMd(raw, path.split('/').pop() ?? 'prompt', section)
  return parsed ? [parsed] : []
}
