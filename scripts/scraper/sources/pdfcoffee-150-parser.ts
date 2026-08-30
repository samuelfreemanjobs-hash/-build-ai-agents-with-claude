import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueDescription,
  generateUniqueTitle,
  rewriteForOriginality,
} from '../transform.ts'
import { slugify, inferCategories, inferModels, inferType, generateTags, isDuplicate, normalizePlaceholders } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'

export const PROMPTS_150_COLLECTION = {
  id: '150-chatgpt-prompts',
  name: '150 Best ChatGPT Prompts',
  sourceUrl: 'https://pdfcoffee.com/150-chatgpt-prompts-pdf-free.html',
}

export interface Section150 {
  id: string
  name: string
  emoji: string
  categoryIds: string[]
  headerPattern: RegExp
}

export const SECTIONS_150: Section150[] = [
  { id: 'marketing', name: 'Marketing', emoji: '📣', categoryIds: ['marketing'], headerPattern: /CHATGPT PROMPTS FOR MARKETING/i },
  { id: 'business', name: 'Business', emoji: '📊', categoryIds: ['business'], headerPattern: /CHATGPT PROMPTS FOR BUSINESS/i },
  { id: 'content', name: 'Content Creation', emoji: '📝', categoryIds: ['content', 'writing'], headerPattern: /CHATGPT PROMPTS FOR CONTENT/i },
  { id: 'web-dev', name: 'Web Development', emoji: '🌐', categoryIds: ['coding'], headerPattern: /CHATGPT PROMPTS FOR WEB DEVELOPMENT/i },
  { id: 'teachers', name: 'Teachers & Education', emoji: '📚', categoryIds: ['education'], headerPattern: /CHATGPT PROMPTS FOR TEACHERS/i },
  { id: 'music', name: 'Music', emoji: '🎵', categoryIds: ['writing'], headerPattern: /CHATGPT PROMPTS FOR MUSIC/i },
  { id: 'fun', name: 'Fun & Entertainment', emoji: '🎉', categoryIds: ['productivity'], headerPattern: /CHATGPT PROMPTS FOR FUN/i },
  { id: 'food', name: 'Food & Cooking', emoji: '🍳', categoryIds: ['content'], headerPattern: /CHATGPT PROMPTS FOR FOOD/i },
]

const PROMPT_START =
  /(?:^|\s)(?:\d+\.\s*)?(?:Provide|Write|Create|Generate|Make|Analyze|Structure|Offer|Suggest|How can|Tell me|Send|Explain|Give me|Come up|Translate|You are|Modify|Develop|Help me|Find|What|Assume|Design|Construct|Can you|I want|I need|To increase|I am|I have|I'?m making)/i

const UNNUMBERED_SPLIT =
  /(?<=[?.!])\s+(?=(?:Provide|Write|Create|Generate|Make|Analyze|Structure|Offer|Suggest|How can|Tell me|Send|Explain|Give me|Come up|Translate|You are|Modify|Develop|Help me|Find|What|Assume|Design|Construct|Can you|I want|I need|To increase|I am|I have|I'?m making)\b)/i

export interface Parsed150Prompt {
  section: Section150
  number: number
  content: string
}

export function clean150RawText(raw: string): string {
  return raw
    .replace(/digitaldaily\.gumroad\.com/gi, '')
    .replace(/pdfcoffee\.com/gi, '')
    .replace(/Page \d+/gi, '')
    .replace(/WORK WITH EASE![\s\S]*?150 BEST CHATGPT PROMTS/i, '')
    .replace(/W\s+SO\s+D\s+O\s+LO AD[\s\S]*?S\. IN/gi, '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim()
}

export function bracketToMustache(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, (_m, inner) => {
    const key = inner
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
    return `{{${key || 'placeholder'}}}`
  })
}

export function extractTitle150(content: string, section: Section150): string {
  const cleaned = content.replace(/\[\s*\]/g, '').trim()
  const verbs = cleaned.match(
    /^(?:\d+\.\s*)?(Provide|Write|Create|Generate|Make|Analyze|Structure|Offer|Suggest|Tell me|Send|Explain|Develop|Help me|Find|Design|Construct|Can you|Come up|Translate|Modify|I want|I need)/i
  )
  const verb = verbs?.[1] ?? 'Prompt'

  const topicMatch = cleaned.match(/\[(?:topic of your choice|product or service or company|your product|concept being taught|topic|artist|Title of the song|Business description|webinar topic|newsletter topic|product name|specific audience|Media channel|Website name|Your product|social media|your target audience|company|Service description|person|profession or topic of your choice|theme of your choice|company or product|subject\/task)\]/i)
  if (topicMatch) {
    const topic = topicMatch[0].replace(/[\[\]]/g, '').slice(0, 30)
    return `${section.name}: ${verb} — ${topic}`
  }

  const snippet = cleaned.replace(/^\d+\.\s*/, '').slice(0, 55).replace(/\s+/g, ' ').trim()
  return snippet.length > 12 ? snippet : `${section.name} ${verb} Prompt`
}

function splitNumberedPrompts(sectionText: string, section: Section150): Parsed150Prompt[] {
  const prompts: Parsed150Prompt[] = []
  const parts = sectionText.split(/(?=\b\d+\.\s)/)

  for (const part of parts) {
    const match = part.match(/^(\d+)\.\s*([\s\S]+)/)
    if (!match) continue
    const content = match[2].trim()
    if (content.length < 15) continue
    prompts.push({ section, number: parseInt(match[1], 10), content })
  }

  return prompts
}

function splitUnnumberedPrompts(sectionText: string, section: Section150): Parsed150Prompt[] {
  const lines = sectionText
    .split('\n')
    .map(normalizeLine)
    .filter((line) => line.length >= 15 && PROMPT_START.test(line) && !section.headerPattern.test(line))

  if (lines.length >= 2) {
    return lines.map((content, i) => ({ section, number: i + 1, content }))
  }

  const flat = sectionText.replace(/\n+/g, ' ')
  const chunks = flat.split(UNNUMBERED_SPLIT).map((s) => s.trim()).filter(Boolean)
  return chunks
    .filter((c) => c.length >= 20 && PROMPT_START.test(c))
    .map((content, i) => ({ section, number: i + 1, content }))
}

export function parse150PromptsText(raw: string): Parsed150Prompt[] {
  const cleaned = clean150RawText(raw)
  const all: Parsed150Prompt[] = []

  const hits: Array<{ index: number; section: Section150; headerLen: number }> = []
  for (const section of SECTIONS_150) {
    const re = new RegExp(section.headerPattern.source, 'gi')
    let m: RegExpExecArray | null
    while ((m = re.exec(cleaned)) !== null) {
      hits.push({ index: m.index, section, headerLen: m[0].length })
    }
  }
  hits.sort((a, b) => a.index - b.index)

  for (let i = 0; i < hits.length; i++) {
    const { index, section, headerLen } = hits[i]
    const end = i + 1 < hits.length ? hits[i + 1].index : cleaned.length
    const body = cleaned.slice(index + headerLen, end).trim()

    const numbered = splitNumberedPrompts(body.replace(/\n/g, ' '), section)
    if (numbered.length >= 3) {
      all.push(...numbered)
    } else {
      all.push(...splitUnnumberedPrompts(body, section))
    }
  }

  return all
}

export function parse150PromptsFile(filePath: string): Parsed150Prompt[] {
  return parse150PromptsText(readFileSync(resolve(filePath), 'utf-8'))
}

function buildPromptContent(raw: string): string {
  const withPlaceholders = bracketToMustache(raw)
  return normalizePlaceholders(withPlaceholders)
}

export function import150Prompts(
  parsed: Parsed150Prompt[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: '150 Best ChatGPT Prompts (PDFCoffee)',
    url: PROMPTS_150_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of parsed) {
    if (results.length >= limit) break

    const baseTitle = extractTitle150(item.content, item.section)
    const uniqueTitle = generateUniqueTitle(baseTitle)
    const normalized = buildPromptContent(item.content)
    const rewritten = rewriteForOriginality(normalized, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...item.section.categoryIds, ...categories], rewritten)
    const models = [...inferModels(categories, rewritten)]

    let id = slugify(`150-${item.section.id}-${uniqueTitle}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(uniqueTitle).slice(0, 50)}-150-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: item.section.emoji || CATEGORY_EMOJI[categories[0]] || '✨',
      description: generateUniqueDescription(uniqueTitle, item.section.name).replace(
        '1000+ Prompts collection',
        '150 Best ChatGPT Prompts collection'
      ),
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([...item.section.categoryIds.slice(0, 1), ...categories.slice(0, 1)])],
      models,
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          item.section.id,
          '150-chatgpt-prompts',
          'swipe-ready',
          'fill-in-blank',
        ]),
      ],
      likes: Math.floor(Math.random() * 25) + 5,
      copies: Math.floor(Math.random() * 60) + 8,
      collection: PROMPTS_150_COLLECTION.id,
      collectionSection: item.section.id,
      source: sourceMeta,
    }

    if (isDuplicate(prompt, [...existingPrompts, ...results], 0.88)) continue
    results.push(prompt)
  }

  return results
}

export async function scrape150PromptsFromFile(
  filePath: string,
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): Promise<ScrapedPrompt[]> {
  console.log(`Parsing 150 ChatGPT Prompts from ${filePath}...`)
  const parsed = parse150PromptsFile(filePath)
  console.log(`  Parsed ${parsed.length} raw prompts`)

  const bySection = parsed.reduce(
    (acc, p) => {
      acc[p.section.id] = (acc[p.section.id] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  for (const [id, count] of Object.entries(bySection)) {
    console.log(`    ${id}: ${count}`)
  }

  return import150Prompts(parsed, existingPrompts, limit)
}
