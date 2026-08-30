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
  GOOFPROMPT_LIBRARY_URL,
  GOOFPROMPT_CACHE_FILE,
  fetchGodOfPromptLibrary,
  parseGodOfPromptPage,
  type GodOfPromptRaw,
} from './godofprompt-fetch.ts'

export const GOOFPROMPT_COLLECTION = {
  id: 'godofprompt',
  name: 'God of Prompt Library',
  sourceUrl: GOOFPROMPT_LIBRARY_URL,
}

export const GOOFPROMPT_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  marketing: { name: 'Marketing', emoji: '📣', categoryIds: ['marketing', 'business'] },
  sales: { name: 'Sales', emoji: '💰', categoryIds: ['sales', 'business'] },
  seo: { name: 'SEO', emoji: '🔍', categoryIds: ['marketing', 'seo'] },
  coding: { name: 'Coding', emoji: '💻', categoryIds: ['coding', 'productivity'] },
  writing: { name: 'Writing & Content', emoji: '✍️', categoryIds: ['writing', 'marketing'] },
  design: { name: 'Design & Image', emoji: '🎨', categoryIds: ['design', 'image'] },
  business: { name: 'Business', emoji: '💼', categoryIds: ['business', 'productivity'] },
  productivity: { name: 'Productivity', emoji: '⚡', categoryIds: ['productivity'] },
}

const MODEL_MAP: Record<string, import('../../src/types/prompt').AIModel> = {
  ChatGPT: 'ChatGPT',
  Claude: 'Claude',
  Gemini: 'Gemini',
  Grok: 'Grok',
  Midjourney: 'Midjourney',
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

function loadCachedRawPrompts(): GodOfPromptRaw[] {
  const cached = resolve(GOOFPROMPT_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as GodOfPromptRaw[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: GodOfPromptRaw[]): GodOfPromptRaw[] {
  const out: GodOfPromptRaw[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importGodOfPromptPrompts(
  rawPrompts: GodOfPromptRaw[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: GOOFPROMPT_COLLECTION.name,
    url: GOOFPROMPT_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'business'
    const section = GOOFPROMPT_SECTIONS[sectionId] ?? GOOFPROMPT_SECTIONS.business
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const isImage = item.type === 'image'
    const structured = isImage
      ? `## Image Generation Prompt\n\n${normalized}\n\n## Usage\nCopy into your AI image generator and replace placeholder variables with your subject details.`
      : item.description
        ? `## Use Case\n${item.description}\n\n## Prompt\n${normalized}`
        : normalized
    const rewritten = rewriteForOriginality(structured, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const inferredType = inferType([...section.categoryIds, ...categories], rewritten)
    const type = isImage ? 'image' : inferredType

    const models =
      item.models?.length
        ? (item.models.filter((m) => MODEL_MAP[m]).map((m) => MODEL_MAP[m]) as import('../../src/types/prompt').AIModel[])
        : isImage
          ? (['Midjourney'] as import('../../src/types/prompt').AIModel[])
          : (['ChatGPT', 'Claude', 'Gemini'] as import('../../src/types/prompt').AIModel[])

    let id = slugify(`gop-${sectionId}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-gop-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '✨',
      description:
        item.description ??
        `Engineered prompt from God of Prompt — ${section.name}. Role/Context/Task structure with swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models,
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'godofprompt',
          'swipe-ready',
          ...(isImage ? ['image-gen'] : ['structured-prompt']),
        ]),
      ],
      likes: Math.floor(Math.random() * 90) + 25,
      copies: Math.floor(Math.random() * 300) + 60,
      collection: GOOFPROMPT_COLLECTION.id,
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

export async function scrapeGodOfPromptLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const fetchResult = await fetchGodOfPromptLibrary(options.live ?? false)
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
  const prompts = importGodOfPromptPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseGodOfPromptFromFile(filePath: string): GodOfPromptRaw[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as GodOfPromptRaw[]
  }
  return parseGodOfPromptPage(raw)
}
