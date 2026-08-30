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
  WHARTON_GAIL_LIBRARY_URL,
  fetchWhartonGailLive,
  parseWhartonHtmlOrMarkdown,
  type WhartonRawPrompt,
} from './wharton-gail-fetch.ts'

export const WHARTON_COLLECTION = {
  id: 'wharton-gail',
  name: 'Wharton GAIL Prompt Library',
  sourceUrl: WHARTON_GAIL_LIBRARY_URL,
}

export const WHARTON_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  'student-roles': { name: 'Student AI Roles', emoji: '🎓', categoryIds: ['education', 'business'] },
  'instructor-blueprints': { name: 'Instructor Blueprints', emoji: '🏗️', categoryIds: ['education', 'business'] },
  'instructor-tools': { name: 'Instructor Tools', emoji: '📋', categoryIds: ['education'] },
  professional: { name: 'Professional & Ideation', emoji: '💡', categoryIds: ['business', 'education'] },
  simulations: { name: 'Simulations & Role Play', emoji: '🎭', categoryIds: ['education'] },
  uncategorized: { name: 'General', emoji: '📚', categoryIds: ['education'] },
}

const SEED_FILE = 'data/sources/wharton-gail-prompts.json'

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

function loadSeedPrompts(filePath = SEED_FILE): WhartonRawPrompt[] {
  const path = resolve(filePath)
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8')) as WhartonRawPrompt[]
}

function loadCachedRawPrompts(): WhartonRawPrompt[] {
  const cached = resolve('data/sources/wharton-gail-scraped.json')
  if (!existsSync(cached)) return []
  try {
    const data = JSON.parse(readFileSync(cached, 'utf-8')) as WhartonRawPrompt[] | { prompts?: WhartonRawPrompt[] }
    return Array.isArray(data) ? data : (data.prompts ?? [])
  } catch {
    return []
  }
}

function dedupeRaw(prompts: WhartonRawPrompt[]): WhartonRawPrompt[] {
  const out: WhartonRawPrompt[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importWhartonPrompts(
  rawPrompts: WhartonRawPrompt[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: WHARTON_COLLECTION.name,
    url: WHARTON_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'uncategorized'
    const section = WHARTON_SECTIONS[sectionId] ?? WHARTON_SECTIONS.uncategorized
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

    let id = slugify(`wharton-${sectionId}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-wg-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '🎓',
      description:
        item.description ??
        `Educational prompt from Wharton Generative AI Labs — ${section.name}: ${item.title}. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: models.length ? models : ['ChatGPT', 'Claude'],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'wharton-gail',
          'education',
          'swipe-ready',
        ]),
      ],
      likes: Math.floor(Math.random() * 40) + 15,
      copies: Math.floor(Math.random() * 120) + 20,
      collection: WHARTON_COLLECTION.id,
      collectionSection: sectionId,
      source: {
        ...sourceMeta,
        url: item.sourceUrl ?? sourceMeta.url,
      },
    }

    if (
      [...existingPrompts, ...results].some(
        (p) =>
          p.id === prompt.id ||
          (p.collection === prompt.collection && similarity(p.content, prompt.content) >= 0.95)
      )
    ) {
      continue
    }

    results.push(prompt)
  }

  return results
}

export async function scrapeWhartonGail(options: {
  live?: boolean
  seedFile?: string
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  let raw: WhartonRawPrompt[] = []
  let method = 'seed'
  let message = ''

  if (options.live) {
    console.log(`Fetching live from ${WHARTON_GAIL_LIBRARY_URL}...`)
    const live = await fetchWhartonGailLive()
    method = live.method
    message = live.message
    if (live.prompts.length) {
      raw = live.prompts
      console.log(`  Live fetch: ${live.prompts.length} raw prompts (${live.method})`)
    } else {
      console.log(`  Live fetch failed: ${live.message}`)
    }
  }

  if (!raw.length) {
    raw = loadCachedRawPrompts()
    if (raw.length) {
      method = 'cached'
      message = `Loaded ${raw.length} prompts from wharton-gail-scraped.json cache`
    }
  }

  if (!raw.length) {
    const seedPath = options.seedFile ?? SEED_FILE
    raw = loadSeedPrompts(seedPath)
    method = 'seed'
    message = `Using seed file ${seedPath} (${raw.length} curated Wharton GAIL prompts)`
    console.log(`  ${message}`)
  }

  raw = dedupeRaw(raw)
  const prompts = importWhartonPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseWhartonFromFile(filePath: string): WhartonRawPrompt[] {
  const raw = readFileSync(resolve(filePath), 'utf-8')
  return parseWhartonHtmlOrMarkdown(raw)
}
