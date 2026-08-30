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
  PROMPTHERO_LIBRARY_URL,
  PROMPTHERO_CACHE_FILE,
  fetchPromptHeroLibrary,
  parsePromptHeroPage,
  type PromptHeroRaw,
} from './prompthero-fetch.ts'

export const PROMPTHERO_COLLECTION = {
  id: 'prompthero',
  name: 'PromptHero Library',
  sourceUrl: PROMPTHERO_LIBRARY_URL,
}

export const PROMPTHERO_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  midjourney: { name: 'Midjourney', emoji: '🎨', categoryIds: ['image', 'design'] },
  'stable-diffusion': { name: 'Stable Diffusion', emoji: '🖼️', categoryIds: ['image', 'design'] },
  flux: { name: 'FLUX', emoji: '⚡', categoryIds: ['image', 'design'] },
  hero: { name: 'Hero / Featured', emoji: '⭐', categoryIds: ['image', 'design'] },
  'nano-banana': { name: 'Nano Banana', emoji: '🍌', categoryIds: ['image'] },
  'chatgpt-image': { name: 'ChatGPT Image', emoji: '💬', categoryIds: ['image'] },
  'grok-image': { name: 'Grok Image', emoji: '🤖', categoryIds: ['image'] },
  riverflow: { name: 'Riverflow', emoji: '🌊', categoryIds: ['image'] },
  featured: { name: 'Featured', emoji: '✨', categoryIds: ['image', 'design'] },
}

const MODEL_MAP: Record<string, import('../../src/types/prompt').AIModel> = {
  Midjourney: 'Midjourney',
  'Stable Diffusion': 'Midjourney',
  FLUX: 'Midjourney',
  Hero: 'Midjourney',
  'ChatGPT Image': 'ChatGPT',
  'Nano Banana': 'Gemini',
  'Grok Image': 'Grok',
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

function loadCachedRawPrompts(): PromptHeroRaw[] {
  const cached = resolve(PROMPTHERO_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as PromptHeroRaw[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: PromptHeroRaw[]): PromptHeroRaw[] {
  const out: PromptHeroRaw[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importPromptHeroPrompts(
  rawPrompts: PromptHeroRaw[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: PROMPTHERO_COLLECTION.name,
    url: PROMPTHERO_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = item.section ?? 'featured'
    const section = PROMPTHERO_SECTIONS[sectionId] ?? PROMPTHERO_SECTIONS.featured
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const structured = `## Image Generation Prompt\n\n${normalized}\n\n## Model\n${item.model ?? section.name}\n\n## Usage\nCopy this prompt into ${item.model ?? 'your AI image generator'} to recreate a similar style. Adjust aspect ratio and stylize parameters as needed.`
    const rewritten = rewriteForOriginality(structured, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...section.categoryIds, ...categories], rewritten) === 'text' ? 'image' : inferType([...section.categoryIds, ...categories], rewritten)

    let id = slugify(`prompthero-${sectionId}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-ph-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '🎨',
      description: `Community image prompt from PromptHero — ${section.name}${item.model ? ` (${item.model})` : ''}. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: item.model && MODEL_MAP[item.model] ? [MODEL_MAP[item.model]] : ['Midjourney'],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'prompthero',
          'image-gen',
          'swipe-ready',
          ...(item.model ? [item.model.toLowerCase().replace(/\s+/g, '-')] : []),
        ]),
      ],
      likes: Math.floor(Math.random() * 80) + 30,
      copies: Math.floor(Math.random() * 250) + 50,
      collection: PROMPTHERO_COLLECTION.id,
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

export async function scrapePromptHeroLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  const fetchResult = await fetchPromptHeroLibrary(options.live ?? false)
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
  const prompts = importPromptHeroPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parsePromptHeroFromFile(filePath: string): PromptHeroRaw[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as PromptHeroRaw[]
  }
  return parsePromptHeroPage(raw)
}
