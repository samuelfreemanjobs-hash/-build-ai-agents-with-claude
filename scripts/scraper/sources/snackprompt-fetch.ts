import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const SNACKPROMPT_BASE = 'https://snackprompt.com'
export const SNACKPROMPT_LIBRARY_URL = `${SNACKPROMPT_BASE}/prompts`
export const SNACKPROMPT_AGENTS_URL = `${SNACKPROMPT_BASE}/ai-agents`
export const SNACKPROMPT_RAW_DIR = 'data/sources/snackprompt-raw'
export const SNACKPROMPT_CACHE_FILE = 'data/sources/snackprompt-scraped.json'
export const SNACKPROMPT_SEED_FILE = 'data/sources/snackprompt-prompts.json'

export interface SnackPromptRaw {
  title: string
  section?: string
  description?: string
  content: string
  models?: string[]
  sourceUrl?: string
  slug?: string
}

export interface SnackPromptFetchResult {
  ok: boolean
  method: 'firecrawl' | 'fetch' | 'seed' | 'cached' | 'none'
  message: string
  prompts: SnackPromptRaw[]
}

const LISTING_URLS = [
  SNACKPROMPT_LIBRARY_URL,
  SNACKPROMPT_AGENTS_URL,
  SNACKPROMPT_BASE,
]

const SECTION_FROM_URL: Record<string, string> = {
  '/ai-agents': 'agents',
  '/prompts': 'prompts',
  '/images': 'images',
  '/automations': 'automations',
}

function saveRaw(name: string, content: string): string {
  mkdirSync(SNACKPROMPT_RAW_DIR, { recursive: true })
  const path = join(SNACKPROMPT_RAW_DIR, name)
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

function inferSection(title: string, pageUrl = ''): string {
  const t = title.toLowerCase()
  if (pageUrl.includes('/ai-agents') || /claude code|openclaw|open claw|agent|automate|bot/.test(t)) return 'agents'
  if (/illustration|animation|portrait|art|cinematic|pixar|image|photograph|claymation|lithograph|origami|charcoal/.test(t)) return 'images'
  if (/marketing|growth|offer|lead|campaign|seo|sales/.test(t)) return 'marketing'
  if (/education|lesson|nist|teach|learn|course/.test(t)) return 'education'
  if (/automation|workflow|n8n|zapier/.test(t)) return 'automations'
  return 'prompts'
}

function extractFromNextData(raw: string, pageUrl: string): SnackPromptRaw[] {
  const results: SnackPromptRaw[] = []
  const match = raw.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return results

  try {
    const data = JSON.parse(match[1]) as unknown
    const json = JSON.stringify(data)
    const promptLinks = json.match(/\/e\/prompt\/[a-z0-9-]+/gi) ?? []
    const titles = json.match(/"title"\s*:\s*"([^"\\]{4,120})"/g) ?? []

    for (const t of titles) {
      const titleMatch = t.match(/"title"\s*:\s*"([^"\\]+)"/)
      const title = titleMatch?.[1]?.trim()
      if (!title || /Snack Prompt|Discover|Create\/Sell/i.test(title)) continue
      results.push({
        title,
        section: inferSection(title, pageUrl),
        content: `Prompt from Snack Prompt community: ${title}\n\nVisit Snack Prompt for the full community version and upvote the original creator.`,
        sourceUrl: pageUrl,
      })
    }

    for (const link of [...new Set(promptLinks)].slice(0, 200)) {
      const slug = link.split('/').pop() ?? ''
      const title = slug.replace(/-[A-Za-z0-9]{6,}$/, '').replace(/-/g, ' ')
      if (title.length < 4) continue
      results.push({
        title: title.replace(/\b\w/g, (c) => c.toUpperCase()),
        slug,
        section: inferSection(title, pageUrl),
        content: `Community prompt from Snack Prompt: ${title.replace(/\b\w/g, (c) => c.toUpperCase())}\n\nSource: ${SNACKPROMPT_BASE}${link}`,
        sourceUrl: `${SNACKPROMPT_BASE}${link}`,
      })
    }
  } catch {
    /* ignore */
  }

  return results
}

/** Parse SnackPrompt listing pages (markdown or HTML) */
export function parseSnackPromptListing(raw: string, pageUrl = SNACKPROMPT_LIBRARY_URL): SnackPromptRaw[] {
  const results: SnackPromptRaw[] = [...extractFromNextData(raw, pageUrl)]

  // Markdown headings as prompt titles (### Title)
  const headings = raw.match(/^#{2,4}\s+([^\n]{4,120})$/gm) ?? []
  for (const h of headings) {
    const title = h.replace(/^#{2,4}\s+/, '').trim()
    if (/Snack Prompt|Discover|Topics|Create|Go to home|Most used|Newest|All/i.test(title)) continue
    if (title.length < 4) continue
    results.push({
      title,
      section: inferSection(title, pageUrl),
      content: `Community prompt from Snack Prompt: ${title}\n\nBrowse and remix this prompt on Snack Prompt.`,
      sourceUrl: pageUrl,
    })
  }

  // Prompt detail URLs in page
  const links = raw.match(/https?:\/\/snackprompt\.com\/e\/prompt\/[a-z0-9-]+/gi) ?? []
  for (const url of [...new Set(links)]) {
    const slug = url.split('/').pop() ?? ''
    const title = slug
      .replace(/-[A-Za-z0-9]{6,}$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    if (title.length < 4) continue
    results.push({
      title,
      slug,
      section: inferSection(title, pageUrl),
      content: `Community prompt from Snack Prompt: ${title}\n\nSource: ${url}`,
      sourceUrl: url,
    })
  }

  // Dedupe by title
  const byTitle = new Map<string, SnackPromptRaw>()
  for (const p of results) {
    const key = p.title.toLowerCase()
    const existing = byTitle.get(key)
    if (!existing || (p.content.length > existing.content.length)) {
      byTitle.set(key, p)
    }
  }

  return [...byTitle.values()].filter((p) => p.content.length >= 50)
}

function loadSeedJson(): SnackPromptRaw[] {
  if (!existsSync(SNACKPROMPT_SEED_FILE)) return []
  try {
    return JSON.parse(readFileSync(SNACKPROMPT_SEED_FILE, 'utf-8')) as SnackPromptRaw[]
  } catch {
    return []
  }
}

function loadCached(): SnackPromptRaw[] {
  if (!existsSync(SNACKPROMPT_CACHE_FILE)) return []
  try {
    return JSON.parse(readFileSync(SNACKPROMPT_CACHE_FILE, 'utf-8')) as SnackPromptRaw[]
  } catch {
    return []
  }
}

export async function fetchSnackPromptLive(): Promise<SnackPromptFetchResult> {
  mkdirSync(SNACKPROMPT_RAW_DIR, { recursive: true })
  const allPrompts: SnackPromptRaw[] = []

  for (const url of LISTING_URLS) {
    const slug = url.replace(/https?:\/\//, '').replace(/[^\w.-]+/g, '-').slice(0, 60)
    const outPath = join(SNACKPROMPT_RAW_DIR, `${slug}.md`)

    runFirecrawl(`scrape "${url}" --only-main-content --wait-for 3000 -o "${outPath}"`)
    let content: string | null = null
    if (existsSync(outPath)) content = readFileSync(outPath, 'utf-8')
    if (!content) content = await fetchText(url)

    if (content && content.length > 200) {
      saveRaw(`${slug}.html`, content.slice(0, 500_000))
      allPrompts.push(...parseSnackPromptListing(content, url))
    }
  }

  if (allPrompts.length) {
    writeFileSync(SNACKPROMPT_CACHE_FILE, JSON.stringify(allPrompts, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'firecrawl',
      message: `Extracted ${allPrompts.length} prompts from Snack Prompt listings`,
      prompts: allPrompts,
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${SNACKPROMPT_BASE}. Using seed/cache fallback.`,
    prompts: [],
  }
}

export async function fetchSnackPromptLibrary(live = false): Promise<SnackPromptFetchResult> {
  if (live) {
    const liveResult = await fetchSnackPromptLive()
    if (liveResult.prompts.length) return liveResult
  }

  const seed = loadSeedJson()
  if (seed.length) {
    return {
      ok: true,
      method: 'seed',
      message: `Loaded ${seed.length} curated prompts from ${SNACKPROMPT_SEED_FILE}`,
      prompts: seed,
    }
  }

  const cached = loadCached()
  if (cached.length) {
    return {
      ok: true,
      method: 'cached',
      message: `Loaded ${cached.length} prompts from ${SNACKPROMPT_CACHE_FILE}`,
      prompts: cached,
    }
  }

  if (live) return fetchSnackPromptLive()

  return {
    ok: false,
    method: 'none',
    message: 'No Snack Prompt data available. Add seed file or run with --live.',
    prompts: [],
  }
}
