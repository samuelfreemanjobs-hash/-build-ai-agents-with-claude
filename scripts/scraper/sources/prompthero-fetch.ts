import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const PROMPTHERO_BASE = 'https://prompthero.com'
export const PROMPTHERO_LIBRARY_URL = PROMPTHERO_BASE
export const PROMPTHERO_RAW_DIR = 'data/sources/prompthero-raw'
export const PROMPTHERO_CACHE_FILE = 'data/sources/prompthero-scraped.json'
export const PROMPTHERO_SEED_PAGE = 'data/sources/prompthero-page.txt'

export const PROMPTHERO_LISTING_URLS = [
  PROMPTHERO_BASE,
  `${PROMPTHERO_BASE}/midjourney-prompts`,
  `${PROMPTHERO_BASE}/stable-diffusion-prompts`,
]

export interface PromptHeroRaw {
  title: string
  section?: string
  model?: string
  description?: string
  content: string
  sourceUrl?: string
}

export interface PromptHeroFetchResult {
  ok: boolean
  method: 'firecrawl' | 'fetch' | 'seed' | 'cached' | 'none'
  message: string
  prompts: PromptHeroRaw[]
}

const KNOWN_MODELS = new Set([
  'Midjourney',
  'Stable Diffusion',
  'FLUX',
  'Hero',
  'ChatGPT Image',
  'Nano Banana',
  'Grok Image',
  'Riverflow',
  'Sora',
  'DALL-E',
  'Leonardo',
  'Ideogram',
])

const SKIP_LINE =
  /^(PromptHero|Search Prompts|Browse the best|The #1|Search by|As seen in|Prompt by |Related Topics|Discover millions|No prompts found|Verified$|^\d+$|Resources|Midjourney Prompts|Stable Diffusion Prompts|## |Search millions of AI prompts|hand-picked inspiration)/i

const PROMPT_HINT =
  /(--ar |--stylize |--v |--chaos |photorealistic|hyper-realistic|cinematic|portrait|photography|illustration|8[kK]|editorial|anime|oil painting|\{ "title"|Unreal Engine|masterpiece|shot on|f\/1\.|selfie|painting on canvas)/i

function saveRaw(name: string, content: string): string {
  mkdirSync(PROMPTHERO_RAW_DIR, { recursive: true })
  const path = join(PROMPTHERO_RAW_DIR, name)
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

export function titleFromPromptHeroContent(content: string): string {
  const c = content.replace(/\n/g, ' ').trim()
  if (c.startsWith('{')) {
    try {
      const d = JSON.parse(c.endsWith('}') ? c : `${c.split('}')[0]}}`) as { title?: string }
      if (d.title) return d.title.slice(0, 70)
    } catch {
      /* ignore */
    }
  }
  return c.split(',')[0].slice(0, 70)
}

function inferSection(model: string, line: string, pageSection: string): string {
  if (/--ar |--stylize|--v /.test(line)) return 'midjourney'
  if (pageSection === 'midjourney') return 'midjourney'
  if (pageSection === 'stable-diffusion') return 'stable-diffusion'
  const m = model.toLowerCase().replace(/\s+/g, '-')
  if (['flux', 'hero', 'nano-banana', 'chatgpt-image', 'grok-image', 'riverflow'].includes(m)) return m
  if (model === 'Stable Diffusion') return 'stable-diffusion'
  if (model === 'Midjourney') return 'midjourney'
  return 'featured'
}

/** Parse PromptHero listing page text (markdown or HTML converted to text) */
export function parsePromptHeroPage(raw: string, pageUrl = PROMPTHERO_BASE, pageSection = 'featured'): PromptHeroRaw[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  const prompts: PromptHeroRaw[] = []
  let currentModel =
    pageSection === 'midjourney'
      ? 'Midjourney'
      : pageSection === 'stable-diffusion'
        ? 'Stable Diffusion'
        : 'featured'

  for (const line of lines) {
    if (KNOWN_MODELS.has(line)) {
      currentModel = line
      continue
    }
    if (SKIP_LINE.test(line) || line.length < 60) continue
    if (!PROMPT_HINT.test(line)) continue

    const section = inferSection(currentModel, line, pageSection)
    prompts.push({
      title: titleFromPromptHeroContent(line),
      section,
      model: currentModel === 'featured' ? undefined : currentModel,
      content: line,
      sourceUrl: pageUrl,
    })
  }

  return prompts
}

function dedupePrompts(prompts: PromptHeroRaw[]): PromptHeroRaw[] {
  const byContent = new Map<string, PromptHeroRaw>()
  for (const p of prompts) {
    const key = p.content.slice(0, 150).toLowerCase()
    if (!byContent.has(key)) byContent.set(key, p)
  }
  return [...byContent.values()]
}

function loadSeedPage(): PromptHeroRaw[] {
  if (!existsSync(PROMPTHERO_SEED_PAGE)) return []
  try {
    const raw = readFileSync(PROMPTHERO_SEED_PAGE, 'utf-8')
    const parts = raw.split('\n\n\n')
    const all: PromptHeroRaw[] = []
    if (parts.length >= 3) {
      all.push(...parsePromptHeroPage(parts[0], PROMPTHERO_BASE, 'featured'))
      all.push(...parsePromptHeroPage(parts[1], `${PROMPTHERO_BASE}/midjourney-prompts`, 'midjourney'))
      all.push(...parsePromptHeroPage(parts[2], `${PROMPTHERO_BASE}/stable-diffusion-prompts`, 'stable-diffusion'))
    } else {
      all.push(...parsePromptHeroPage(raw))
      all.push(...parsePromptHeroPage(raw, `${PROMPTHERO_BASE}/midjourney-prompts`, 'midjourney'))
      all.push(...parsePromptHeroPage(raw, `${PROMPTHERO_BASE}/stable-diffusion-prompts`, 'stable-diffusion'))
    }
    return dedupePrompts(all)
  } catch {
    return []
  }
}

function loadSeedJson(): PromptHeroRaw[] {
  if (!existsSync(PROMPTHERO_CACHE_FILE)) return []
  try {
    return JSON.parse(readFileSync(PROMPTHERO_CACHE_FILE, 'utf-8')) as PromptHeroRaw[]
  } catch {
    return []
  }
}

export async function fetchPromptHeroLive(): Promise<PromptHeroFetchResult> {
  mkdirSync(PROMPTHERO_RAW_DIR, { recursive: true })
  const allPrompts: PromptHeroRaw[] = []

  for (const url of PROMPTHERO_LISTING_URLS) {
    const slug = url.replace(/https?:\/\//, '').replace(/[^\w.-]+/g, '-').slice(0, 60)
    const pageSection = url.includes('midjourney')
      ? 'midjourney'
      : url.includes('stable-diffusion')
        ? 'stable-diffusion'
        : 'featured'
    const outPath = join(PROMPTHERO_RAW_DIR, `${slug}.md`)

    runFirecrawl(`scrape "${url}" --only-main-content --wait-for 3000 -o "${outPath}"`)
    let content: string | null = null
    if (existsSync(outPath)) content = readFileSync(outPath, 'utf-8')
    if (!content) content = await fetchText(url)

    if (content && content.length > 200) {
      saveRaw(`${slug}.html`, content.slice(0, 500_000))
      allPrompts.push(...parsePromptHeroPage(content, url, pageSection))
    }
  }

  const deduped = dedupePrompts(allPrompts)
  if (deduped.length) {
    writeFileSync(PROMPTHERO_CACHE_FILE, JSON.stringify(deduped, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'firecrawl',
      message: `Live fetch extracted ${deduped.length} prompts from PromptHero`,
      prompts: deduped,
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${PROMPTHERO_BASE}. Using seed/cache fallback.`,
    prompts: [],
  }
}

export async function fetchPromptHeroLibrary(live = false): Promise<PromptHeroFetchResult> {
  if (live) {
    const liveResult = await fetchPromptHeroLive()
    if (liveResult.prompts.length) return liveResult
  }

  const fromPage = loadSeedPage()
  if (fromPage.length) {
    writeFileSync(PROMPTHERO_CACHE_FILE, JSON.stringify(fromPage, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'seed',
      message: `Parsed ${fromPage.length} prompts from ${PROMPTHERO_SEED_PAGE}`,
      prompts: fromPage,
    }
  }

  const cached = loadSeedJson()
  if (cached.length) {
    return {
      ok: true,
      method: 'cached',
      message: `Loaded ${cached.length} prompts from ${PROMPTHERO_CACHE_FILE}`,
      prompts: cached,
    }
  }

  if (live) return fetchPromptHeroLive()

  return {
    ok: false,
    method: 'none',
    message: 'No PromptHero data available. Add seed file or run with --live.',
    prompts: [],
  }
}
