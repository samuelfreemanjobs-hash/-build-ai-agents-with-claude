import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const WHARTON_GAIL_BASE = 'https://gail.wharton.upenn.edu'
export const WHARTON_GAIL_LIBRARY_URL = `${WHARTON_GAIL_BASE}/prompt-library/`

export const WHARTON_RAW_DIR = 'data/sources/wharton-gail-raw'

export interface WhartonRawPrompt {
  title: string
  section?: string
  description?: string
  content: string
  models?: string[]
  sourceUrl?: string
}

export interface WhartonFetchResult {
  ok: boolean
  method: 'firecrawl' | 'fetch' | 'seed' | 'none'
  message: string
  pages: string[]
  prompts: WhartonRawPrompt[]
}

function saveRaw(name: string, content: string): string {
  mkdirSync(WHARTON_RAW_DIR, { recursive: true })
  const path = join(WHARTON_RAW_DIR, name)
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
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** Discover WordPress REST routes and custom post types */
async function discoverWpApi(): Promise<string[]> {
  const index = await fetchText(`${WHARTON_GAIL_BASE}/wp-json/`)
  if (!index) return []
  try {
    const data = JSON.parse(index) as { routes?: Record<string, unknown> }
    return Object.keys(data.routes ?? {}).filter(
      (r) => r.includes('prompt') || r.includes('library') || r.startsWith('/wp/v2/')
    )
  } catch {
    return []
  }
}

/** Parse HTML/markdown for prompt cards (accordion, copy blocks, pre/code) */
export function parseWhartonHtmlOrMarkdown(raw: string, pageUrl = WHARTON_GAIL_LIBRARY_URL): WhartonRawPrompt[] {
  const results: WhartonRawPrompt[] = []
  const seen = new Set<string>()

  // Pattern: headings followed by "You are..." blocks
  const youAreBlocks = raw.match(/You are[\s\S]{80,8000}?(?=(?:\n#{1,3}\s|\nYou are|\n---|\n\n\n|$))/gi) ?? []
  for (const block of youAreBlocks) {
    const cleaned = block.trim()
    if (cleaned.length < 80 || seen.has(cleaned.slice(0, 120))) continue
    seen.add(cleaned.slice(0, 120))
    const titleMatch = cleaned.match(/^You are (?:an? |the )?([^.\n]{4,60})/i)
    results.push({
      title: titleMatch?.[1]?.trim() ?? 'GAIL Prompt',
      content: cleaned,
      sourceUrl: pageUrl,
    })
  }

  // JSON-LD or embedded JSON arrays
  const jsonMatches = raw.match(/\[\s*\{[\s\S]*?"title"[\s\S]*?"content"[\s\S]*?\}\s*\]/g) ?? []
  for (const j of jsonMatches) {
    try {
      const arr = JSON.parse(j) as WhartonRawPrompt[]
      for (const item of arr) {
        if (item.content?.length > 50) results.push({ ...item, sourceUrl: item.sourceUrl ?? pageUrl })
      }
    } catch {
      /* ignore */
    }
  }

  return results
}

/** Live scrape via Firecrawl crawl or direct fetch */
export async function fetchWhartonGailLive(): Promise<WhartonFetchResult> {
  mkdirSync(WHARTON_RAW_DIR, { recursive: true })
  const pages: string[] = []
  const allPrompts: WhartonRawPrompt[] = []

  // 1) Firecrawl map + scrape (works when FIRECRAWL_API_KEY set and network allows)
  const mapOut = runFirecrawl(`map "${WHARTON_GAIL_LIBRARY_URL}" --limit 100 --json`)
  if (mapOut) {
    saveRaw('firecrawl-map.json', mapOut)
    pages.push('firecrawl-map.json')
    let urls: string[] = [WHARTON_GAIL_LIBRARY_URL]
    try {
      const parsed = JSON.parse(mapOut) as { urls?: string[]; links?: string[] }
      urls = [...new Set([WHARTON_GAIL_LIBRARY_URL, ...(parsed.urls ?? parsed.links ?? [])])].filter((u) =>
        u.includes('gail.wharton.upenn.edu')
      )
    } catch {
      /* use default */
    }

    for (const url of urls.slice(0, 50)) {
      const outPath = join(WHARTON_RAW_DIR, `page-${slugFromUrl(url)}.md`)
      const scraped = runFirecrawl(`scrape "${url}" --only-main-content -o "${outPath}"`)
      if (scraped !== null && existsSync(outPath)) {
        pages.push(outPath)
        const md = await fetchText(`file://${outPath}`).catch(() => null)
        if (md) allPrompts.push(...parseWhartonHtmlOrMarkdown(md, url))
      }
    }

    if (allPrompts.length > 0) {
      return { ok: true, method: 'firecrawl', message: `Firecrawl extracted ${allPrompts.length} prompts`, pages, prompts: allPrompts }
    }
  }

  // 2) Direct fetch main page + WP API
  const html = await fetchText(WHARTON_GAIL_LIBRARY_URL)
  if (html) {
    const path = saveRaw('prompt-library.html', html)
    pages.push(path)
    allPrompts.push(...parseWhartonHtmlOrMarkdown(html))
  }

  const wpRoutes = await discoverWpApi()
  if (wpRoutes.length) saveRaw('wp-routes.json', JSON.stringify(wpRoutes, null, 2))

  for (const route of wpRoutes.filter((r) => r.includes('prompt'))) {
    const json = await fetchText(`${WHARTON_GAIL_BASE}/wp-json${route}`)
    if (!json) continue
    const path = saveRaw(`wp-${route.replace(/\//g, '_')}.json`, json)
    pages.push(path)
    try {
      const data = JSON.parse(json) as Array<{ title?: { rendered?: string }; content?: { rendered?: string }; acf?: Record<string, string> }>
      if (Array.isArray(data)) {
        for (const post of data) {
          const title = post.title?.rendered ?? 'Untitled'
          const contentHtml = post.content?.rendered ?? ''
          const parsed = parseWhartonHtmlOrMarkdown(contentHtml)
          if (parsed.length) allPrompts.push(...parsed.map((p) => ({ ...p, title: p.title === 'GAIL Prompt' ? title : p.title })))
          else if (contentHtml.length > 80) {
            allPrompts.push({ title, content: stripHtml(contentHtml), sourceUrl: WHARTON_GAIL_LIBRARY_URL })
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (allPrompts.length > 0) {
    return { ok: true, method: 'fetch', message: `Fetched ${allPrompts.length} prompts from live site`, pages, prompts: allPrompts }
  }

  return {
    ok: false,
    method: 'none',
    message: 'Could not reach gail.wharton.upenn.edu from this environment. Use seed file or run locally with network access.',
    pages,
    prompts: [],
  }
}

function slugFromUrl(url: string): string {
  return url.replace(/https?:\/\//, '').replace(/[^\w.-]+/g, '-').slice(0, 80)
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
