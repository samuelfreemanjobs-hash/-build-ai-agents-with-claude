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
  GEMINI_PROMPTS_URL,
  GEMINI_CACHE_FILE,
  GEMINI_SEED_FILE,
  fetchGeminiPromptLibrary,
  extractPromptsFromNotebook,
  type GeminiRawPrompt,
} from './gemini-prompt-fetch.ts'

export const GEMINI_COLLECTION = {
  id: 'gemini-api-prompts',
  name: 'Gemini API Prompt Gallery',
  sourceUrl: GEMINI_PROMPTS_URL,
}

export const GEMINI_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  'prompt-gallery': { name: 'Prompt Gallery', emoji: '✨', categoryIds: ['productivity', 'writing'] },
  'prompting-techniques': { name: 'Prompting Techniques', emoji: '🎯', categoryIds: ['education', 'writing'] },
  'cookbook-examples': { name: 'Cookbook Examples', emoji: '📘', categoryIds: ['productivity', 'business'] },
  multimodal: { name: 'Multimodal', emoji: '🖼️', categoryIds: ['image', 'productivity'] },
  'structured-output': { name: 'Structured Output', emoji: '📋', categoryIds: ['coding', 'productivity'] },
  coding: { name: 'Code & Testing', emoji: '💻', categoryIds: ['coding'] },
  creative: { name: 'Creative', emoji: '🎨', categoryIds: ['writing', 'design'] },
  education: { name: 'Education', emoji: '🎓', categoryIds: ['education'] },
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

function loadCachedRawPrompts(): GeminiRawPrompt[] {
  const cached = resolve(GEMINI_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as GeminiRawPrompt[]
  } catch {
    return []
  }
}

function loadSeedPrompts(): GeminiRawPrompt[] {
  const seed = resolve(GEMINI_SEED_FILE)
  if (!existsSync(seed)) return []
  try {
    return JSON.parse(readFileSync(seed, 'utf-8')) as GeminiRawPrompt[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: GeminiRawPrompt[]): GeminiRawPrompt[] {
  const out: GeminiRawPrompt[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 40) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importGeminiPrompts(
  rawPrompts: GeminiRawPrompt[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: GEMINI_COLLECTION.name,
    url: GEMINI_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'cookbook-examples'
    const section = GEMINI_SECTIONS[sectionId] ?? GEMINI_SECTIONS['cookbook-examples']
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const structured = item.description
      ? `## Description\n${item.description}\n\n## Prompt\n${normalized}`
      : normalized
    const rewritten = rewriteForOriginality(structured, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...section.categoryIds, ...categories], rewritten)

    let id = slugify(`gemini-${sectionId}-${item.title}`)
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
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '💎',
      description:
        item.description ??
        `Official Gemini API prompt from Google's Prompt Gallery / Cookbook — ${section.name}: ${item.title}. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: ['Gemini'],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'gemini',
          'google',
          'swipe-ready',
        ]),
      ],
      likes: Math.floor(Math.random() * 55) + 25,
      copies: Math.floor(Math.random() * 180) + 40,
      collection: GEMINI_COLLECTION.id,
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

export async function scrapeGeminiPromptLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const fetchResult = await fetchGeminiPromptLibrary(options.live ?? false)
  let raw = fetchResult.prompts
  let method = fetchResult.method
  let message = fetchResult.message

  if (!raw.length) {
    raw = loadSeedPrompts()
    if (raw.length) {
      method = 'seed'
      message = `Loaded ${raw.length} prompts from ${GEMINI_SEED_FILE}`
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
  const prompts = importGeminiPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseGeminiFromFile(filePath: string): GeminiRawPrompt[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as GeminiRawPrompt[]
  }
  if (path.endsWith('.ipynb')) {
    const notebookPath = path.split('/').slice(-2).join('/')
    return extractPromptsFromNotebook(raw, notebookPath)
  }
  return JSON.parse(raw) as GeminiRawPrompt[]
}
