import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  PDFCOFFEE_COLLECTION,
  matchSectionByHeader,
  type CollectionSection,
} from '../collections/pdfcoffee-categories.ts'
import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueDescription,
  generateUniqueTitle,
  rewriteForOriginality,
} from '../transform.ts'
import { slugify, inferCategories, inferModels, inferType, generateTags, isDuplicate } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'

const PAGE_FOOTER =
  /\d+\s*\|\s*(?:P\s*a\s*g\s*e\s*)?Course:\s*ChatGPT\s*&\s*Bing AI Prompt Engineering Master By Navin B/gi

const SECTION_HEADER_ALTS = PDFCOFFEE_COLLECTION.sections
  .filter((s) => s.headerPattern)
  .map((s) => s.headerPattern!)
  .sort((a, b) => b.source.length - a.source.length)

export interface ParsedRawPrompt {
  section: CollectionSection
  number: number
  content: string
}

export function cleanRawText(raw: string): string {
  let text = raw

  // Drop Scribd UI before actual document content
  const startMarkers = ['Bing Image Prompts1)', 'Bing Image Prompts 1)', '2|PageCourse']
  for (const marker of startMarkers) {
    const idx = text.indexOf(marker)
    if (idx > 0) {
      text = text.slice(idx)
      break
    }
  }

  // Also try markdown section header
  const mdIdx = text.indexOf('## The Massive Prompt List')
  if (mdIdx >= 0) {
    const after = text.indexOf('Bing Image Prompts', mdIdx)
    if (after >= 0) text = text.slice(after)
  }

  text = text.replace(PAGE_FOOTER, ' ')
  text = text.replace(/\d+\|PageCourse:[^\n]*/gi, ' ')
  text = text.replace(/pdfcoffee\.com/gi, '')
  text = text.replace(/\s+/g, ' ')

  return text.trim()
}

export function extractTitleFromPrompt(content: string, section: CollectionSection): string {
  const actMatch = content.match(/Act as (?:an? )?([^,.]+)/i)
  if (actMatch) {
    const role = actMatch[1].trim().slice(0, 60)
    return `${section.name}: ${role}`
  }

  if (section.id === 'image-prompts') {
    const firstSentence = content.split(/[.!?]/)[0]?.trim().slice(0, 70)
    return firstSentence ? `Image: ${firstSentence}` : `Image Prompt ${section.name}`
  }

  const snippet = content.slice(0, 70).replace(/\s+/g, ' ').trim()
  return snippet.length > 10 ? snippet : `${section.name} Prompt`
}

function splitSectionPrompts(sectionText: string, section: CollectionSection): ParsedRawPrompt[] {
  const prompts: ParsedRawPrompt[] = []
  const isImageSection = section.id === 'image-prompts'

  // Split on numbered items: "1." or "1)" at word boundaries
  const parts = sectionText.split(/(?=\b\d+[.)]\s)/)

  for (const part of parts) {
    const match = part.match(/^(\d+)[.)]\s*([\s\S]+)/)
    if (!match) continue

    const number = parseInt(match[1], 10)
    let content = match[2].trim()

    // Trim trailing section header if bleed-through
    for (const pattern of SECTION_HEADER_ALTS) {
      const headerMatch = content.match(pattern)
      if (headerMatch && headerMatch.index !== undefined && headerMatch.index > 40) {
        content = content.slice(0, headerMatch.index).trim()
      }
    }

    if (content.length < (isImageSection ? 40 : 60)) continue

    prompts.push({ section, number, content })
  }

  return prompts
}

export function parsePdfCoffeeText(raw: string): ParsedRawPrompt[] {
  const cleaned = cleanRawText(raw)
  const allPrompts: ParsedRawPrompt[] = []

  // Build combined section regex
  const sectionNames = PDFCOFFEE_COLLECTION.sections
    .filter((s) => s.headerPattern)
    .map((s) => ({
      section: s,
      pattern: s.headerPattern!,
    }))

  // Find all section positions
  const hits: Array<{ index: number; section: CollectionSection; headerLen: number }> = []

  for (const { section, pattern } of sectionNames) {
    const re = new RegExp(pattern.source, pattern.flags.includes('i') ? 'gi' : 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(cleaned)) !== null) {
      hits.push({ index: m.index, section, headerLen: m[0].length })
    }
  }

  hits.sort((a, b) => a.index - b.index)

  // Deduplicate overlapping hits at same index (keep longest header match)
  const deduped: typeof hits = []
  for (const hit of hits) {
    const existing = deduped.find((h) => Math.abs(h.index - hit.index) < 5)
    if (!existing) deduped.push(hit)
    else if (hit.headerLen > existing.headerLen) {
      const idx = deduped.indexOf(existing)
      deduped[idx] = hit
    }
  }

  for (let i = 0; i < deduped.length; i++) {
    const { index, section, headerLen } = deduped[i]
    const end = i + 1 < deduped.length ? deduped[i + 1].index : cleaned.length
    const sectionBody = cleaned.slice(index + headerLen, end).trim()
    const sectionPrompts = splitSectionPrompts(sectionBody, section)
    allPrompts.push(...sectionPrompts)
  }

  return allPrompts
}

export function parsePdfCoffeeFile(filePath: string): ParsedRawPrompt[] {
  const abs = resolve(filePath)
  const raw = readFileSync(abs, 'utf-8')
  return parsePdfCoffeeText(raw)
}

export function importParsedPrompts(
  parsed: ParsedRawPrompt[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: '1000+ Prompts Collection (PDFCoffee)',
    url: PDFCOFFEE_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of parsed) {
    if (results.length >= limit) break

    const baseTitle = extractTitleFromPrompt(item.content, item.section)
    const uniqueTitle = generateUniqueTitle(baseTitle)
    const rewritten = rewriteForOriginality(item.content, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...item.section.categoryIds, ...categories], rewritten)
    const models: import('../../src/types/prompt').AIModel[] =
      type === 'image' ? ['Midjourney'] : [...inferModels(categories, rewritten)]

    let id = slugify(`${item.section.id}-${uniqueTitle}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(uniqueTitle).slice(0, 50)}-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: item.section.emoji || CATEGORY_EMOJI[categories[0]] || '✨',
      description: generateUniqueDescription(uniqueTitle, item.section.name),
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([...item.section.categoryIds.slice(0, 1), ...categories.slice(0, 1)])],
      models: [...models],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          item.section.id,
          '1000-prompts',
          'swipe-ready',
          'pdfcoffee',
        ]),
      ],
      likes: Math.floor(Math.random() * 30) + 5,
      copies: Math.floor(Math.random() * 80) + 10,
      collection: PDFCOFFEE_COLLECTION.id,
      collectionSection: item.section.id,
      source: sourceMeta,
    }

    if (isDuplicate(prompt, [...existingPrompts, ...results], 0.82)) continue
    results.push(prompt)
  }

  return results
}

export async function scrapePdfCoffeeFromFile(
  filePath: string,
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): Promise<ScrapedPrompt[]> {
  console.log(`Parsing PDFCoffee text from ${filePath}...`)
  const parsed = parsePdfCoffeeFile(filePath)
  console.log(`  Parsed ${parsed.length} raw prompts across sections`)

  const bySection = parsed.reduce(
    (acc, p) => {
      acc[p.section.id] = (acc[p.section.id] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  console.log(`  Sections: ${Object.keys(bySection).length}`)
  for (const [id, count] of Object.entries(bySection).sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`    ${id}: ${count}`)
  }

  return importParsedPrompts(parsed, existingPrompts, limit)
}
