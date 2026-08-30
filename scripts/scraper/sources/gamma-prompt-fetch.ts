import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const GAMMA_LIBRARY_URL = 'https://gamma.app/prompts#browse-all'
export const GAMMA_LIBRARY_BASE = 'https://gamma.app/prompts'
export const GAMMA_RAW_DIR = 'data/sources/gamma-prompt-library-raw'
export const GAMMA_CACHE_FILE = 'data/sources/gamma-prompt-library-scraped.json'
export const GAMMA_SEED_RAW = 'data/sources/gamma-prompt-library-page.txt'

export interface GammaRawPrompt {
  title: string
  section?: string
  description?: string
  content: string
  sourceUrl?: string
}

export interface GammaFetchResult {
  ok: boolean
  method: 'fetch' | 'firecrawl' | 'seed' | 'cached' | 'none'
  message: string
  prompts: GammaRawPrompt[]
}

const SECTION_HEADERS: Array<[string, string]> = [
  ['## Most popular', 'popular'],
  ['### For consultants', 'consultants'],
  ['### For educators', 'educators'],
  ['### For marketers', 'marketers'],
  ['### For sales professionals', 'sales'],
  ['### General', 'general'],
]

const PROMPT_VERB =
  'Create|Build|Design|Structure|Brief|Plan|Make|Present|Develop|Outline|Draft|Write|Prepare|Generate|Craft|Compose|Welcome|Launch|Position|Tell|Convert|Show|Explain|Compare|Analyze|Map|Review|Pitch|Propose|Recap|Summarize|Introduce|Teach|Guide|Walk|Demo|Sell|Close|Negotiate|Onboard|Train|Assess|Evaluate|Research|Forecast|Model|Simulate|Visualize|Illustrate|Document|Report'

const ACTION_RE = new RegExp(`^(${PROMPT_VERB})\\b`, 'i')

function saveRaw(name: string, content: string): string {
  mkdirSync(GAMMA_RAW_DIR, { recursive: true })
  const path = join(GAMMA_RAW_DIR, name)
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
      timeout: 120_000,
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

export function titleFromGammaContent(content: string): string {
  const m = content.match(
    new RegExp(`^(${PROMPT_VERB})\\s+(?:a|an|your|the)?\\s*(.+?)(?::|$)`, 'i')
  )
  if (m?.[2]) {
    const t = m[2].trim()
    return (t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 70)
  }
  return content.slice(0, 60)
}

/** Parse Gamma prompt library page (markdown or HTML converted to text) */
export function parseGammaLibraryPage(raw: string, pageUrl = GAMMA_LIBRARY_URL): GammaRawPrompt[] {
  const cutoff = raw.split(/##\s*API automations/i)[0]
  const prompts: GammaRawPrompt[] = []

  for (let i = 0; i < SECTION_HEADERS.length; i++) {
    const [header, section] = SECTION_HEADERS[i]
    const start = cutoff.indexOf(header)
    if (start < 0) continue

    let end = cutoff.length
    for (let j = i + 1; j < SECTION_HEADERS.length; j++) {
      const pos = cutoff.indexOf(SECTION_HEADERS[j][0], start + header.length)
      if (pos >= 0) end = Math.min(end, pos)
    }

    const chunk = cutoff.slice(start + header.length, end)
    for (const block of chunk.split(/\n---+\n/)) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && l !== 'View prompt' && !l.startsWith('#') && !l.startsWith('- '))
      if (!lines.length) continue

      const line = lines[0]
      if (!ACTION_RE.test(line) || line.length < 50) continue
      if (/^Prompts that others/i.test(line)) continue

      prompts.push({
        title: titleFromGammaContent(line),
        section,
        content: line,
        sourceUrl: pageUrl,
      })
    }
  }

  // Dedupe — prefer categorized sections over "popular"
  const byContent = new Map<string, GammaRawPrompt>()
  for (const p of prompts) {
    const key = p.content.toLowerCase()
    const existing = byContent.get(key)
    if (!existing || (existing.section === 'popular' && p.section !== 'popular')) {
      byContent.set(key, p)
    }
  }

  return [...byContent.values()]
}

function loadSeedJson(): GammaRawPrompt[] {
  if (!existsSync(GAMMA_CACHE_FILE)) return []
  try {
    return JSON.parse(readFileSync(GAMMA_CACHE_FILE, 'utf-8')) as GammaRawPrompt[]
  } catch {
    return []
  }
}

function loadSeedPageText(): GammaRawPrompt[] {
  if (!existsSync(GAMMA_SEED_RAW)) return []
  try {
    const raw = readFileSync(GAMMA_SEED_RAW, 'utf-8')
    return parseGammaLibraryPage(raw)
  } catch {
    return []
  }
}

export async function fetchGammaPromptLibraryLive(): Promise<GammaFetchResult> {
  mkdirSync(GAMMA_RAW_DIR, { recursive: true })

  const outPath = join(GAMMA_RAW_DIR, 'gamma-prompts.md')
  const scrapeUrl = GAMMA_LIBRARY_BASE
  const scraped = runFirecrawl(`scrape "${scrapeUrl}" --only-main-content -o "${outPath}"`)
  if (scraped !== null && existsSync(outPath)) {
    const md = readFileSync(outPath, 'utf-8')
    const prompts = parseGammaLibraryPage(md)
    if (prompts.length) {
      writeFileSync(GAMMA_CACHE_FILE, JSON.stringify(prompts, null, 2), 'utf-8')
      return {
        ok: true,
        method: 'firecrawl',
        message: `Firecrawl extracted ${prompts.length} prompts from ${GAMMA_LIBRARY_URL}`,
        prompts,
      }
    }
  }

  const html = await fetchText(GAMMA_LIBRARY_BASE)
  if (html && html.length > 500) {
    saveRaw('gamma-prompts.html', html)
    const prompts = parseGammaLibraryPage(html)
    if (prompts.length) {
      writeFileSync(GAMMA_CACHE_FILE, JSON.stringify(prompts, null, 2), 'utf-8')
      return {
        ok: true,
        method: 'fetch',
        message: `Direct fetch extracted ${prompts.length} prompts from ${GAMMA_LIBRARY_URL}`,
        prompts,
      }
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${GAMMA_LIBRARY_URL}. Using seed/cache fallback.`,
    prompts: [],
  }
}

export async function fetchGammaPromptLibrary(live = false): Promise<GammaFetchResult> {
  if (live) {
    const liveResult = await fetchGammaPromptLibraryLive()
    if (liveResult.prompts.length) return liveResult
  }

  const fromPage = loadSeedPageText()
  if (fromPage.length) {
    writeFileSync(GAMMA_CACHE_FILE, JSON.stringify(fromPage, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'seed',
      message: `Parsed ${fromPage.length} prompts from ${GAMMA_SEED_RAW}`,
      prompts: fromPage,
    }
  }

  const cached = loadSeedJson()
  if (cached.length) {
    return {
      ok: true,
      method: 'cached',
      message: `Loaded ${cached.length} prompts from ${GAMMA_CACHE_FILE}`,
      prompts: cached,
    }
  }

  if (live) {
    return fetchGammaPromptLibraryLive()
  }

  return {
    ok: false,
    method: 'none',
    message: 'No Gamma prompts available. Add seed file or run with --live.',
    prompts: [],
  }
}
