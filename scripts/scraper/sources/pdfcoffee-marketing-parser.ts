import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueDescription,
  generateUniqueTitle,
  rewriteForOriginality,
} from '../transform.ts'
import { slugify, inferCategories, inferModels, inferType, generateTags, similarity, normalizePlaceholders } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'

export const BONUS3_COLLECTION = {
  id: 'bonus3-marketing',
  name: 'BONUS 3 AI Marketing Prompt Library',
  sourceUrl: 'https://pdfcoffee.com/bonus-3-ai-marketing-prompt-library-pdf-free.html',
}

export interface MarketingCategory {
  id: string
  name: string
  emoji: string
  categoryIds: string[]
  headerPattern: RegExp
}

export const MARKETING_CATEGORIES: MarketingCategory[] = [
  { id: 'research-assets', name: 'Research & Assets', emoji: '🔬', categoryIds: ['marketing'], headerPattern: /CATEGORY 1:\s*Research & Assets/i },
  { id: 'content-strategy', name: 'Content Strategy', emoji: '💡', categoryIds: ['marketing', 'content'], headerPattern: /CATEGORY 2:\s*Content Strategy/i },
  { id: 'design', name: 'Design Suggestions', emoji: '🎨', categoryIds: ['design', 'marketing'], headerPattern: /CATEGORY 3:\s*Design/i },
  { id: 'campaigns', name: 'Campaign Ideas', emoji: '🚀', categoryIds: ['marketing'], headerPattern: /CATEGORY 4:\s*Campaign/i },
  { id: 'email', name: 'Email Marketing', emoji: '📧', categoryIds: ['email', 'marketing'], headerPattern: /CATEGORY 5:\s*Email Marketing/i },
  { id: 'social-growth', name: 'Social Media Growth', emoji: '📱', categoryIds: ['social-media', 'marketing'], headerPattern: /CATEGORY 6:\s*Social Media/i },
  { id: 'paid-ads', name: 'Paid Ads', emoji: '🖱️', categoryIds: ['marketing'], headerPattern: /CATEGORY 7:\s*Paid Ads/i },
  { id: 'strategy', name: 'High-Level Strategy', emoji: '🎯', categoryIds: ['business', 'marketing'], headerPattern: /CATEGORY 8:\s*High-Level/i },
  { id: 'seo-blogging', name: 'SEO & Blogging', emoji: '🔍', categoryIds: ['seo', 'content'], headerPattern: /CATEGORY 9:\s*SEO/i },
  { id: 'brand-voice', name: 'Brand Voice & Identity', emoji: '🎭', categoryIds: ['marketing', 'business'], headerPattern: /CATEGORY 10:\s*Brand Voice/i },
  { id: 'customer-retention', name: 'Customer Support & Retention', emoji: '🤝', categoryIds: ['customer-service', 'marketing'], headerPattern: /CATEGORY 11:\s*Customer Support/i },
  { id: 'product-launch', name: 'Product Launch & Events', emoji: '🎪', categoryIds: ['marketing'], headerPattern: /CATEGORY 12:\s*Product Launch/i },
  { id: 'influencer', name: 'Influencer & Networking', emoji: '🌟', categoryIds: ['social-media', 'marketing'], headerPattern: /CATEGORY 13:\s*Influencer/i },
]

export interface ParsedMarketingPrompt {
  category: MarketingCategory
  number: number
  title: string
  useCase: string
  content: string
}

function bracketToMustache(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, (_m, inner) => {
    const key = inner
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 45)
    return `{{${key || 'placeholder'}}}`
  })
}

function extractQuotedPrompt(block: string): string | null {
  const quoted = [...block.matchAll(/"([^"]{40,})"/g)].map((m) => m[1].trim())
  if (quoted.length === 0) return null
  return quoted.sort((a, b) => b.length - a.length)[0]
}

function parsePromptBlock(block: string, category: MarketingCategory): ParsedMarketingPrompt | null {
  const headerMatch = block.match(/^(\d+)\.\s*The\s+"([^"]+)"(?:\s*\([^)]*\))?\s*([\s\S]*)/)
  if (!headerMatch) return null

  const number = parseInt(headerMatch[1], 10)
  const title = headerMatch[2].trim()
  const rest = headerMatch[3].trim()

  const promptText = extractQuotedPrompt(`"${rest}"`) ?? extractQuotedPrompt(block)
  if (!promptText || promptText.length < 30) return null

  const useCaseEnd = rest.indexOf('"')
  const useCase = useCaseEnd > 0 ? rest.slice(0, useCaseEnd).trim() : ''

  return {
    category,
    number,
    title,
    useCase,
    content: promptText,
  }
}

export function parseBonus3MarketingText(raw: string): ParsedMarketingPrompt[] {
  const cleaned = raw
    .replace(/pdfcoffee\.com/gi, '')
    .replace(/Citation preview/gi, '')
    .replace(/\r\n/g, '\n')
    .trim()

  const results: ParsedMarketingPrompt[] = []

  const categoryHits: Array<{ index: number; category: MarketingCategory; headerLen: number }> = []
  for (const category of MARKETING_CATEGORIES) {
    const re = new RegExp(category.headerPattern.source, 'gi')
    let m: RegExpExecArray | null
    while ((m = re.exec(cleaned)) !== null) {
      categoryHits.push({ index: m.index, category, headerLen: m[0].length })
    }
  }
  categoryHits.sort((a, b) => a.index - b.index)

  for (let i = 0; i < categoryHits.length; i++) {
    const { index, category, headerLen } = categoryHits[i]
    const end = i + 1 < categoryHits.length ? categoryHits[i + 1].index : cleaned.length
    const body = cleaned.slice(index + headerLen, end)

    // Split only at line-start prompt headers — avoid false splits inside numbers like "10." → "0. The"
    const blocks = body.split(/(?:^|\n)(?=\d+\.\s*The\s+")/m)
    for (const block of blocks) {
      const parsed = parsePromptBlock(block.trim(), category)
      if (parsed) results.push(parsed)
    }
  }

  return results
}

export function parseBonus3MarketingFile(filePath: string): ParsedMarketingPrompt[] {
  return parseBonus3MarketingText(readFileSync(resolve(filePath), 'utf-8'))
}

function buildMarketingContent(item: ParsedMarketingPrompt): string {
  const normalized = normalizePlaceholders(bracketToMustache(item.content))
  if (item.useCase) {
    return `## Use Case\n${item.useCase}\n\n## Prompt\n${normalized}`
  }
  return normalized
}

export function importBonus3Prompts(
  parsed: ParsedMarketingPrompt[],
  existingPrompts: import('../types.ts').ScrapedPrompt[] = [],
  limit = Infinity
): import('../types.ts').ScrapedPrompt[] {
  const sourceMeta = {
    name: 'BONUS 3 AI Marketing Prompt Library',
    url: BONUS3_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: import('../types.ts').ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of parsed) {
    if (results.length >= limit) break

    const baseTitle = item.useCase ? `${item.title} (${item.useCase})` : item.title
    const uniqueTitle = generateUniqueTitle(baseTitle)
    const structured = buildMarketingContent(item)
    const rewritten = rewriteForOriginality(structured, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type =
      item.title.toLowerCase().includes('midjourney') ||
      item.title.toLowerCase().includes('visual') ||
      item.category.id === 'design'
        ? inferType(['image', ...categories], rewritten)
        : inferType([...item.category.categoryIds, ...categories], rewritten)
    const models: import('../../src/types/prompt').AIModel[] =
      type === 'image' ? ['Midjourney'] : [...inferModels(categories, rewritten)]

    let id = slugify(`bonus3-${item.category.id}-${item.number}-${item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(`${item.category.id}-${item.title}`).slice(0, 45)}-b3-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: import('../types.ts').ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: item.category.emoji || CATEGORY_EMOJI[categories[0]] || '📣',
      description: `Marketing prompt from BONUS 3 library — ${item.category.name}: ${item.title}. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([...item.category.categoryIds.slice(0, 1), ...categories.slice(0, 1)])],
      models,
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          item.category.id,
          'bonus3-marketing',
          'swipe-ready',
          'marketing',
        ]),
      ],
      likes: Math.floor(Math.random() * 35) + 10,
      copies: Math.floor(Math.random() * 90) + 15,
      collection: BONUS3_COLLECTION.id,
      collectionSection: item.category.id,
      source: sourceMeta,
    }

    // Same title across categories (e.g. two "Flash Sale" prompts) is intentional — compare content only
    if (
      [...existingPrompts, ...results].some(
        (p) =>
          p.id === prompt.id ||
          (p.collection === prompt.collection &&
            p.collectionSection === prompt.collectionSection &&
            similarity(p.content, prompt.content) >= 0.95)
      )
    ) {
      continue
    }
    results.push(prompt)
  }

  return results
}

export async function scrapeBonus3MarketingFromFile(
  filePath: string,
  existingPrompts: import('../types.ts').ScrapedPrompt[] = [],
  limit = Infinity
): Promise<import('../types.ts').ScrapedPrompt[]> {
  console.log(`Parsing BONUS 3 Marketing Library from ${filePath}...`)
  const parsed = parseBonus3MarketingFile(filePath)
  console.log(`  Parsed ${parsed.length} named marketing prompts`)

  const byCat = parsed.reduce(
    (acc, p) => {
      acc[p.category.id] = (acc[p.category.id] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  for (const [id, count] of Object.entries(byCat)) {
    console.log(`    ${id}: ${count}`)
  }

  return importBonus3Prompts(parsed, existingPrompts, limit)
}
