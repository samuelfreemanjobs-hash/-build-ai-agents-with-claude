import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueTitle,
  rewriteForOriginality,
} from '../transform.ts'
import { slugify, inferCategories, inferType, generateTags, similarity, normalizePlaceholders } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'
import {
  GAMMA_LIBRARY_URL,
  GAMMA_CACHE_FILE,
  fetchGammaPromptLibrary,
  parseGammaLibraryPage,
  type GammaRawPrompt,
} from './gamma-prompt-fetch.ts'

export const GAMMA_COLLECTION = {
  id: 'gamma-prompt-library',
  name: 'Gamma Prompt Library',
  sourceUrl: GAMMA_LIBRARY_URL,
}

export const GAMMA_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  popular: { name: 'Most Popular', emoji: '⭐', categoryIds: ['business', 'marketing'] },
  consultants: { name: 'For Consultants', emoji: '💼', categoryIds: ['business', 'education'] },
  educators: { name: 'For Educators', emoji: '🎓', categoryIds: ['education'] },
  marketers: { name: 'For Marketers', emoji: '📣', categoryIds: ['marketing', 'business'] },
  sales: { name: 'For Sales Professionals', emoji: '🤝', categoryIds: ['business', 'marketing'] },
  general: { name: 'General', emoji: '📊', categoryIds: ['business', 'productivity'] },
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

function loadCachedRawPrompts(): GammaRawPrompt[] {
  const cached = resolve(GAMMA_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as GammaRawPrompt[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: GammaRawPrompt[]): GammaRawPrompt[] {
  const out: GammaRawPrompt[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importGammaPrompts(
  rawPrompts: GammaRawPrompt[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: GAMMA_COLLECTION.name,
    url: GAMMA_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'general'
    const section = GAMMA_SECTIONS[sectionId] ?? GAMMA_SECTIONS.general
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const structured = `## Gamma Presentation Prompt\n\n${normalized}\n\n## Instructions\nUse this prompt in Gamma to generate a presentation, document, or webpage. Customize audience, company, goals, and metrics before generating.`
    const rewritten = rewriteForOriginality(structured, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...section.categoryIds, ...categories], rewritten)

    let id = slugify(`gamma-${sectionId}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-gp-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '📊',
      description: `Presentation prompt from Gamma's official library — ${section.name}. Optimized for AI-generated decks, docs, and web pages. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: ['ChatGPT', 'Claude', 'Gemini'],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'gamma',
          'presentation',
          'swipe-ready',
        ]),
      ],
      likes: Math.floor(Math.random() * 55) + 25,
      copies: Math.floor(Math.random() * 180) + 40,
      collection: GAMMA_COLLECTION.id,
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

export async function scrapeGammaPromptLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const fetchResult = await fetchGammaPromptLibrary(options.live ?? false)
  let raw = fetchResult.prompts
  let method = fetchResult.method
  let message = fetchResult.message

  if (!raw.length) {
    raw = loadCachedRawPrompts()
    if (raw.length) {
      method = 'cached'
      message = `Loaded ${raw.length} prompts from ${GAMMA_CACHE_FILE}`
    }
  }

  console.log(`  ${message || `Found ${raw.length} raw prompts`}`)
  raw = dedupeRaw(raw)
  const prompts = importGammaPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseGammaFromFile(filePath: string): GammaRawPrompt[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as GammaRawPrompt[]
  }
  return parseGammaLibraryPage(raw)
}
