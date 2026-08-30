import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const GOOFPROMPT_BASE = 'https://godofprompt.ai'
export const GOOFPROMPT_LIBRARY_URL = `${GOOFPROMPT_BASE}/prompt-library`
export const GOOFPROMPT_RAW_DIR = 'data/sources/godofprompt-raw'
export const GOOFPROMPT_CACHE_FILE = 'data/sources/godofprompt-scraped.json'
export const GOOFPROMPT_SEED_PAGE = 'data/sources/godofprompt-page.txt'

export interface GodOfPromptRaw {
  title: string
  section?: string
  description?: string
  content: string
  models?: string[]
  type?: 'text' | 'image'
  sourceUrl?: string
}

export interface GodOfPromptFetchResult {
  ok: boolean
  method: 'firecrawl' | 'fetch' | 'seed' | 'cached' | 'none'
  message: string
  prompts: GodOfPromptRaw[]
}

const SKIP_TITLE =
  /^(Search|Category|Models|Roles|Sort by|Popular|The God of Prompt|Free, curated|Browse|What is|How is|Is the|Which AI|How fast|Can I use|Are the|What should|How do I|Get new|Join |Send me|Read more|## |Most popular|Image prompts|Every card|Three ways|Yes\.|Most text|Most prompts|A prompt library|Why use|How a prompt|What's inside|Who the library|Free to copy|Browse by|Text Prompts|Code Prompts|Search Prompts)/i

const CATEGORY_HINTS: Array<{ pattern: RegExp; section: string }> = [
  { pattern: /email|newsletter|survey invitation|welcome email|follow-up/i, section: 'marketing' },
  { pattern: /sales funnel|conversion|lead nurture|funnel/i, section: 'sales' },
  { pattern: /SEO|keyword|search engine/i, section: 'seo' },
  { pattern: /code|software architecture|SQL|debug|refactor|developer/i, section: 'coding' },
  { pattern: /podcast|video|youtube|social media|content|viral|contrarian|writing/i, section: 'writing' },
  { pattern: /portrait|midjourney|hyper-realistic|photograph|illustration|flux|dall-e|image|mugshot|fashion grid|advertisement/i, section: 'design' },
  { pattern: /financial|business|automation|process improvement|trademark|brand|market research|industry trends|reddit/i, section: 'business' },
  { pattern: /customer support|support guidelines|hallucination|analytical/i, section: 'productivity' },
]

function saveRaw(name: string, content: string): string {
  mkdirSync(GOOFPROMPT_RAW_DIR, { recursive: true })
  const path = join(GOOFPROMPT_RAW_DIR, name)
  writeFileSync(path, content, 'utf-8')
  return path
}

function runFirecrawl(args: string): string | null {
  try {
    const cmd = existsSync('./node_modules/.bin/firecrawl')
      ? './node_modules/.bin/firecrawl'
      : 'firecrawl'
    return execSync(`${cmd} ${args}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 180_000,
    })
  } catch {
    return null
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PromptLibraryScraper/1.0 (educational; contact: prompt-library-app)',
        Accept: 'text/html,application/json,text/markdown,*/*',
      },
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function inferSection(title: string, content: string, description = ''): string {
  const blob = `${title} ${description} ${content}`.toLowerCase()
  for (const { pattern, section } of CATEGORY_HINTS) {
    if (pattern.test(blob)) return section
  }
  return 'business'
}

function inferModels(title: string, content: string, description = ''): string[] {
  const blob = `${title} ${description} ${content}`
  const models: string[] = []
  if (/ChatGPT|GPT-?5|GPT-?4/i.test(blob)) models.push('ChatGPT')
  if (/Claude|Opus|Sonnet/i.test(blob)) models.push('Claude')
  if (/Gemini|Nano Banana/i.test(blob)) models.push('Gemini')
  if (/Grok/i.test(blob)) models.push('Grok')
  if (/Midjourney|Flux|DALL-E|DALL·E/i.test(blob)) models.push('Midjourney')
  return models.length ? [...new Set(models)] : ['ChatGPT', 'Claude', 'Gemini']
}

function inferPromptType(title: string, content: string, description = ''): 'text' | 'image' {
  const blob = `${title} ${description} ${content}`
  if (/Midjourney|Flux|DALL-E|hyper-realistic|portrait photograph|8K portrait|shot on DSLR|--ar /i.test(blob))
    return 'image'
  if (content.startsWith('## Role') || content.startsWith('## Task')) return 'text'
  if (/photograph|illustration|image generation|mugshot|editorial fashion/i.test(blob)) return 'image'
  return 'text'
}

function cleanTitle(line: string): string {
  return line
    .replace(/^#+\s*/, '')
    .replace(/^###\s*[^\s]+\s*/, '')
    .replace(/^(Popular|New)\s*/i, '')
    .trim()
}

function findTitleBefore(raw: string, index: number): string {
  const before = raw.slice(0, index).trim().split('\n').filter(Boolean)
  for (let i = before.length - 1; i >= 0; i--) {
    const line = cleanTitle(before[i])
    if (line.length >= 8 && line.length <= 100 && !SKIP_TITLE.test(line) && !/^\d+$/.test(line)) {
      return line
    }
  }
  return ''
}

function findDescriptionAfter(raw: string, endIndex: number): string {
  const after = raw.slice(endIndex, endIndex + 600)
  const descMatch = after.match(/###\s*[^\n]+\n\n([^\n#][^\n]{20,300})/)
  return descMatch?.[1]?.trim() ?? ''
}

/** Parse God of Prompt library page export (markdown with code blocks) */
export function parseGodOfPromptPage(raw: string, pageUrl = GOOFPROMPT_LIBRARY_URL): GodOfPromptRaw[] {
  const prompts: GodOfPromptRaw[] = []
  const blockRegex = /```\n([\s\S]*?)```/g
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(raw)) !== null) {
    const content = match[1].trim()
    if (content.length < 80) continue

    const start = match.index
    const end = start + match[0].length
    let title = findTitleBefore(raw, start)
    const description = findDescriptionAfter(raw, end)
    const afterTitle = raw.slice(end, end + 200).match(/###\s*[^\s]*\s*(.+)/)?.[1]?.trim()
    if (afterTitle && afterTitle.length >= 8) title = cleanTitle(afterTitle)
    if (!title) {
      if (content.startsWith('## Role')) title = 'Structured Business Prompt'
      else title = content.split('\n')[0].slice(0, 70)
    }
    if (SKIP_TITLE.test(title)) continue

    const section = inferSection(title, content, description)
    const type = inferPromptType(title, content, description)
    const models = inferModels(title, content, description)

    prompts.push({
      title,
      section,
      description: description || undefined,
      content,
      models,
      type,
      sourceUrl: pageUrl,
    })
  }

  return dedupePrompts(prompts)
}

function dedupePrompts(prompts: GodOfPromptRaw[]): GodOfPromptRaw[] {
  const byContent = new Map<string, GodOfPromptRaw>()
  for (const p of prompts) {
    const key = p.content.slice(0, 120).toLowerCase()
    if (!byContent.has(key)) byContent.set(key, p)
  }
  return [...byContent.values()]
}

function loadSeedPage(): GodOfPromptRaw[] {
  if (!existsSync(GOOFPROMPT_SEED_PAGE)) return []
  try {
    const raw = readFileSync(GOOFPROMPT_SEED_PAGE, 'utf-8')
    return parseGodOfPromptPage(raw)
  } catch {
    return []
  }
}

function loadSeedJson(): GodOfPromptRaw[] {
  if (!existsSync(GOOFPROMPT_CACHE_FILE)) return []
  try {
    return JSON.parse(readFileSync(GOOFPROMPT_CACHE_FILE, 'utf-8')) as GodOfPromptRaw[]
  } catch {
    return []
  }
}

export async function fetchGodOfPromptLive(): Promise<GodOfPromptFetchResult> {
  mkdirSync(GOOFPROMPT_RAW_DIR, { recursive: true })
  const outPath = join(GOOFPROMPT_RAW_DIR, 'prompt-library.md')

  runFirecrawl(`scrape "${GOOFPROMPT_LIBRARY_URL}" --only-main-content --wait-for 3000 -o "${outPath}"`)
  let content: string | null = null
  if (existsSync(outPath)) content = readFileSync(outPath, 'utf-8')
  if (!content) content = await fetchText(GOOFPROMPT_LIBRARY_URL)

  if (content && content.length > 500) {
    saveRaw('prompt-library.html', content.slice(0, 500_000))
    const prompts = parseGodOfPromptPage(content)
    if (prompts.length) {
      writeFileSync(GOOFPROMPT_CACHE_FILE, JSON.stringify(prompts, null, 2), 'utf-8')
      return {
        ok: true,
        method: 'firecrawl',
        message: `Live fetch extracted ${prompts.length} prompts from God of Prompt`,
        prompts,
      }
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${GOOFPROMPT_BASE}. Using seed/cache fallback.`,
    prompts: [],
  }
}

export async function fetchGodOfPromptLibrary(live = false): Promise<GodOfPromptFetchResult> {
  if (live) {
    const liveResult = await fetchGodOfPromptLive()
    if (liveResult.prompts.length) return liveResult
  }

  const fromPage = loadSeedPage()
  if (fromPage.length) {
    writeFileSync(GOOFPROMPT_CACHE_FILE, JSON.stringify(fromPage, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'seed',
      message: `Parsed ${fromPage.length} prompts from ${GOOFPROMPT_SEED_PAGE}`,
      prompts: fromPage,
    }
  }

  const cached = loadSeedJson()
  if (cached.length) {
    return {
      ok: true,
      method: 'cached',
      message: `Loaded ${cached.length} prompts from ${GOOFPROMPT_CACHE_FILE}`,
      prompts: cached,
    }
  }

  if (live) return fetchGodOfPromptLive()

  return {
    ok: false,
    method: 'none',
    message: 'No God of Prompt data available. Add seed file or run with --live.',
    prompts: [],
  }
}
