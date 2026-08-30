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
  ANTHROPIC_LIBRARY_URL,
  ANTHROPIC_CACHE_FILE,
  fetchAnthropicPromptLibrary,
  parsePromptMd,
  type AnthropicRawPrompt,
} from './anthropic-prompt-fetch.ts'

export const ANTHROPIC_COLLECTION = {
  id: 'anthropic-prompt-library',
  name: 'Anthropic Prompt Library',
  sourceUrl: ANTHROPIC_LIBRARY_URL,
}

export const ANTHROPIC_SECTIONS: Record<string, { name: string; emoji: string; categoryIds: string[] }> = {
  developer: { name: 'Developer', emoji: '💻', categoryIds: ['coding', 'productivity'] },
  business: { name: 'Business', emoji: '💼', categoryIds: ['business', 'marketing'] },
  personal: { name: 'Personal', emoji: '✨', categoryIds: ['writing', 'lifestyle'] },
}

/** Official Anthropic library categories mapped by folder slug */
const FOLDER_SECTIONS: Record<string, string> = {
  // Developer
  CodeClarifier: 'developer',
  CodeConsultant: 'developer',
  CosmicKeystrokes: 'developer',
  CsvConverter: 'developer',
  DataOrganizer: 'developer',
  EfficiencyEstimator: 'developer',
  EmailExtractor: 'developer',
  ExcelFormulaExpert: 'developer',
  FunctionFabricator: 'developer',
  GitGud: 'developer',
  GoogleAppsScriper: 'developer',
  LatexLegend: 'developer',
  MoodColorizer: 'developer',
  PiiPurifier: 'developer',
  PythonBugBuster: 'developer',
  SpreadsheetSorcerer: 'developer',
  SqlSorcerer: 'developer',
  WebsiteWizard: 'developer',
  AirportCodeAnalyst: 'developer',
  // Business
  BabelsBroadcasts: 'business',
  BrandBuilder: 'business',
  CareerCoach: 'business',
  GradingGuru: 'business',
  InterviewQuestionCrafter: 'business',
  MasterModerator: 'business',
  MeetingScribe: 'business',
  MemoMaestro: 'business',
  ProductNamingPro: 'business',
  ReviewClassifier: 'business',
  TweetToneDetector: 'business',
}

function inferSection(item: AnthropicRawPrompt): string {
  if (item.section && ANTHROPIC_SECTIONS[item.section]) return item.section
  if (FOLDER_SECTIONS[item.folder]) return FOLDER_SECTIONS[item.folder]

  const text = `${item.title} ${item.content}`.toLowerCase()
  if (/code|python|sql|git|excel|website|html|json|csv|api|debug|function|script/.test(text)) return 'developer'
  if (/meeting|memo|brand|career|business|product|review|interview|moderat|classifier/.test(text)) return 'business'
  return 'personal'
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

function loadCachedRawPrompts(): AnthropicRawPrompt[] {
  const cached = resolve(ANTHROPIC_CACHE_FILE)
  if (!existsSync(cached)) return []
  try {
    return JSON.parse(readFileSync(cached, 'utf-8')) as AnthropicRawPrompt[]
  } catch {
    return []
  }
}

function dedupeRaw(prompts: AnthropicRawPrompt[]): AnthropicRawPrompt[] {
  const out: AnthropicRawPrompt[] = []
  for (const p of prompts) {
    if (!p.content || p.content.length < 50) continue
    if (out.some((x) => similarity(x.content, p.content) > 0.92)) continue
    out.push(p)
  }
  return out
}

export function importAnthropicPrompts(
  rawPrompts: AnthropicRawPrompt[],
  existingPrompts: ScrapedPrompt[] = [],
  limit = Infinity
): ScrapedPrompt[] {
  const sourceMeta = {
    name: ANTHROPIC_COLLECTION.name,
    url: ANTHROPIC_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const item of rawPrompts) {
    if (results.length >= limit) break

    const sectionId = inferSection(item)
    const section = ANTHROPIC_SECTIONS[sectionId] ?? ANTHROPIC_SECTIONS.personal
    const uniqueTitle = generateUniqueTitle(item.title)
    const normalized = bracketToMustache(item.content)
    const rewritten = rewriteForOriginality(normalized, uniqueTitle)
    const categories = inferCategories(uniqueTitle, rewritten)
    const type = inferType([...section.categoryIds, ...categories], rewritten)

    let id = slugify(`anthropic-${sectionId}-${item.folder || item.title}`)
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${slugify(item.title).slice(0, 40)}-ap-${suffix++}`
    }
    existingIds.add(id)

    const fillInBlank = generateFillInBlank(rewritten)
    const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

    const prompt: ScrapedPrompt = {
      id,
      title: uniqueTitle,
      emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '🤖',
      description: `Official-style prompt from Anthropic's Prompt Library — ${section.name}: ${item.title}. Includes swipes and fill-in-the-blank template.`,
      content: rewritten,
      fillInBlank,
      swipes,
      categories: [...new Set([section.categoryIds[0], ...categories.slice(0, 1)])],
      models: ['Claude'],
      type,
      tags: [
        ...new Set([
          ...generateTags(uniqueTitle, categories),
          sectionId,
          'anthropic',
          'claude',
          'swipe-ready',
        ]),
      ],
      likes: Math.floor(Math.random() * 50) + 20,
      copies: Math.floor(Math.random() * 150) + 30,
      collection: ANTHROPIC_COLLECTION.id,
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

export async function scrapeAnthropicPromptLibrary(options: {
  live?: boolean
  existingPrompts?: ScrapedPrompt[]
  limit?: number
}): Promise<{ prompts: ScrapedPrompt[]; method: string; message: string }> {
  let raw: AnthropicRawPrompt[] = []
  let method = 'github-mirror'
  let message = ''

  const fetchResult = await fetchAnthropicPromptLibrary(options.live ?? false)
  method = fetchResult.method
  message = fetchResult.message
  raw = fetchResult.prompts

  if (!raw.length) {
    raw = loadCachedRawPrompts()
    if (raw.length) {
      method = 'cached'
      message = `Loaded ${raw.length} prompts from ${ANTHROPIC_CACHE_FILE}`
    }
  }

  console.log(`  ${message || `Found ${raw.length} raw prompts`}`)
  raw = dedupeRaw(raw)
  const prompts = importAnthropicPrompts(raw, options.existingPrompts ?? [], options.limit ?? Infinity)
  return { prompts, method, message }
}

export function parseAnthropicFromFile(filePath: string): AnthropicRawPrompt[] {
  const path = resolve(filePath)
  const raw = readFileSync(path, 'utf-8')
  if (path.endsWith('.json')) {
    return JSON.parse(raw) as AnthropicRawPrompt[]
  }
  const folder = path.split('/').slice(-2, -1)[0] ?? 'Prompt'
  return [parsePromptMd(raw, folder)]
}
