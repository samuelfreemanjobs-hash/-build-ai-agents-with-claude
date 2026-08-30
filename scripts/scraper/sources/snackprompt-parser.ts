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
  SNACKPROMPT_LIBRARY_URL,
  SNACKPROMPT_CACHE_FILE,
  SNACKPROMPT_SEED_FILE,
  fetchSnackPromptLibrary,
  parseSnackPromptListing,
  type SnackPromptRaw,
} from './snackprompt-fetch.ts'

export const SNACKPROMPT_COLLECTION = {
  id: 'snackprompt',
  name: 'Snack Prompt Library',
  sourceUrl: SNACKPROMPT_LIBRARY_URL,
}

export const SNACKPROMPT_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  agents: { name: 'AI Agents', emoji: '🤖', categoryIds: ['coding', 'productivity'] },
  prompts: { name: 'Community Prompts', emoji: '💬', categoryIds: ['writing', 'business'] },
  images: { name: 'AI Images', emoji: '🎨', categoryIds: ['image', 'design'] },
  marketing: { name: 'Marketing', emoji: '📣', categoryIds: ['marketing', 'business'] },
  education: { name: 'Education', emoji: '🎓', categoryIds: ['education'] },
  automations: { name: 'Automations', emoji: '⚡', categoryIds: ['productivity', 'coding'] },
  productivity: { name: 'Productivity', emoji: '📋', categoryIds: ['productivity', 'business'] },
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

function loadCachedRawPrompts(): SnackPromptRaw[] {
  const cached = resolve(SNACKPROMPT_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as SnackPromptRaw[]
  } catch {
    return []
  }
}

function loadSeedPrompts(): SnackPromptRaw[] {
  const seed = resolve(SNACKPROMPT_SEED_FILE)
  if (!existsSync(seed)) return []
  try {
    return JSON.parse(readFileSync(seed, 'utf-8')) as SnackPromptRaw[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: SnackPromptRaw[]): SnackPromptRaw[] {
  const out: SnackPromptRaw[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importSnackPrompts(
  rawPrompts: SnackPromptRaw[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: SNACKPROMPT_COLLECTION.name,
    url: SNACKPROMPT_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'prompts'
    const section = SNACKPROMPT_SECTIONS[sectionId] ?? SNACKPROMPT_SECTIONS.prompts
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const rewritten = rewriteForOriginality(normalized, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...section.categoryIds, ...categories], rewritten)
    const models =
      item.models?.length
        ? (item.models.filter((m) =>
            ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney'].includes(m)
          ) as import('../../src/types/prompt').AIModel[])
        : inferModels(categories, rewritten)

    let id = slugify(`snackprompt-${sectionId}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-sp-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '🍿',
      description:
        item.description ??
        `Community prompt from Snack Prompt — ${section.name}: ${item.title}. Includes swipes and fill-in-the-blank template.`,
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
          'snackprompt',
          'community',
          'swipe-ready',
        ]),
      ],
      likes: Math.floor(Math.random() * 60) + 20,
      copies: Math.floor(Math.random() * 200) + 30,
      collection: SNACKPROMPT_COLLECTION.id,
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

export async function scrapeSnackPromptLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const fetchResult = await fetchSnackPromptLibrary(options.live ?? false)
  let raw = fetchResult.prompts
  let method = fetchResult.method
  let message = fetchResult.message

  if (!raw.length) {
    raw = loadSeedPrompts()
    if (raw.length) {
      method = 'seed'
      message = `Loaded ${raw.length} prompts from ${SNACKPROMPT_SEED_FILE}`
    }
  }

  if (!raw.length) {
    raw = loadCachedRawPrompts()
    if (raw.length) {
      method = 'cached'
      message = `Loaded ${raw.length} prompts from cache`
    }
  }

  console.log(`  ${message || `Found ${raw.length} raw prompts`}`)
  raw = dedupeRaw(raw)
  const prompts = importSnackPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseSnackPromptFromFile(filePath: string): SnackPromptRaw[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as SnackPromptRaw[]
  }
  return parseSnackPromptListing(raw)
}
