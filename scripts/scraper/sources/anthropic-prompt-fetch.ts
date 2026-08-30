import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const ANTHROPIC_LIBRARY_URL = 'https://docs.anthropic.com/en/prompt-library/library'
export const GITHUB_MIRROR_REPO = 'mikewangmax/claude-prompt-library'
export const GITHUB_MIRROR_BASE = `https://raw.githubusercontent.com/${GITHUB_MIRROR_REPO}/main`
export const ANTHROPIC_RAW_DIR = 'data/sources/anthropic-prompt-library-raw'
export const ANTHROPIC_CACHE_FILE = 'data/sources/anthropic-prompt-library-scraped.json'

export interface AnthropicRawPrompt {
  title: string
  folder: string
  section?: string
  description?: string
  system?: string
  user?: string
  content: string
  sourceUrl?: string
}

export interface AnthropicFetchResult {
  ok: boolean
  method: 'github-mirror' | 'firecrawl' | 'cached' | 'none'
  message: string
  prompts: AnthropicRawPrompt[]
}

function saveRaw(name: string, content: string): string {
  mkdirSync(ANTHROPIC_RAW_DIR, { recursive: true })
  const path = join(ANTHROPIC_RAW_DIR, name)
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
        Accept: 'text/plain,text/markdown,application/json,text/html,*/*',
      },
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** Convert CamelCase folder name to display title */
export function folderToTitle(folder: string): string {
  return folder
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
}

/** Parse Anthropic prompt.md format (System/User blocks or tab-separated) */
export function parsePromptMd(raw: string, folder: string): AnthropicRawPrompt {
  const title = folderToTitle(folder)
  let system: string | undefined
  let user: string | undefined

  const systemMatch = raw.match(/\*\*System:\*\*\s*\n([\s\S]*?)(?=\n\*\*User:\*\*|\nUser[\t:]|\n\nUser[\t:]|$)/i)
  const userMatch = raw.match(/\*\*User:\*\*\s*\n([\s\S]*?)$/i)
  const tabUserMatch = raw.match(/^User[\t:]\s*\n?([\s\S]+)$/im)

  if (systemMatch) system = systemMatch[1].trim()
  if (userMatch) user = userMatch[1].trim()
  else if (tabUserMatch) user = tabUserMatch[1].trim()

  const parts: string[] = []
  if (system) parts.push(`## System\n${system}`)
  if (user) parts.push(`## User\n${user}`)
  const content = parts.length ? parts.join('\n\n') : raw.trim()

  return {
    title,
    folder,
    system,
    user,
    content,
    sourceUrl: `${GITHUB_MIRROR_BASE}/${folder}/prompt.md`,
  }
}

async function listMirrorPromptPaths(): Promise<string[]> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_MIRROR_REPO}/git/trees/main?recursive=1`
  const json = await fetchText(apiUrl)
  if (!json) return []
  try {
    const data = JSON.parse(json) as { tree?: Array<{ path: string }> }
    return (data.tree ?? [])
      .map((t) => t.path)
      .filter((p) => p.endsWith('/prompt.md'))
      .sort()
  } catch {
    return []
  }
}

/** Fetch all prompts from the GitHub mirror (works when docs.anthropic.com is blocked) */
export async function fetchAnthropicFromGitHubMirror(): Promise<AnthropicFetchResult> {
  mkdirSync(ANTHROPIC_RAW_DIR, { recursive: true })
  const paths = await listMirrorPromptPaths()
  if (!paths.length) {
    return {
      ok: false,
      method: 'none',
      message: 'Could not list prompt files from GitHub mirror',
      prompts: [],
    }
  }

  const prompts: AnthropicRawPrompt[] = []
  for (const relPath of paths) {
    const folder = relPath.replace('/prompt.md', '')
    const url = `${GITHUB_MIRROR_BASE}/${folder}/prompt.md`
    const raw = await fetchText(url)
    if (!raw || raw.length < 30) continue
    saveRaw(`${folder}-prompt.md`, raw)
    prompts.push(parsePromptMd(raw, folder))
  }

  if (prompts.length) {
    writeFileSync(ANTHROPIC_CACHE_FILE, JSON.stringify(prompts, null, 2), 'utf-8')
  }

  return {
    ok: prompts.length > 0,
    method: 'github-mirror',
    message: `Fetched ${prompts.length} prompts from GitHub mirror (${GITHUB_MIRROR_REPO})`,
    prompts,
  }
}

/** Attempt live scrape of Anthropic docs (requires network + Firecrawl API key) */
export async function fetchAnthropicLive(): Promise<AnthropicFetchResult> {
  mkdirSync(ANTHROPIC_RAW_DIR, { recursive: true })

  const outPath = join(ANTHROPIC_RAW_DIR, 'anthropic-library.md')
  const scraped = runFirecrawl(`scrape "${ANTHROPIC_LIBRARY_URL}" --only-main-content -o "${outPath}"`)
  if (scraped !== null && existsSync(outPath)) {
    const md = await fetchText(`file://${outPath}`).catch(() => null)
    if (md && md.length > 200) {
      const livePrompts = parseAnthropicLibraryMarkdown(md)
      if (livePrompts.length) {
        writeFileSync(ANTHROPIC_CACHE_FILE, JSON.stringify(livePrompts, null, 2), 'utf-8')
        return {
          ok: true,
          method: 'firecrawl',
          message: `Firecrawl extracted ${livePrompts.length} prompts from Anthropic docs`,
          prompts: livePrompts,
        }
      }
    }
  }

  const html = await fetchText(ANTHROPIC_LIBRARY_URL)
  if (html && html.length > 500) {
    saveRaw('anthropic-library.html', html)
    const livePrompts = parseAnthropicLibraryMarkdown(html)
    if (livePrompts.length) {
      writeFileSync(ANTHROPIC_CACHE_FILE, JSON.stringify(livePrompts, null, 2), 'utf-8')
      return {
        ok: true,
        method: 'firecrawl',
        message: `Direct fetch extracted ${livePrompts.length} prompts from Anthropic docs`,
        prompts: livePrompts,
      }
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${ANTHROPIC_LIBRARY_URL}. Using GitHub mirror fallback.`,
    prompts: [],
  }
}

/** Best-effort parse of Anthropic library page markdown/HTML */
export function parseAnthropicLibraryMarkdown(raw: string): AnthropicRawPrompt[] {
  const results: AnthropicRawPrompt[] = []
  const seen = new Set<string>()

  // Card titles like "### Meeting scribe" or heading links
  const blocks = raw.split(/(?=#{2,3}\s)/)
  for (const block of blocks) {
    const titleMatch = block.match(/^#{2,3}\s+([^\n]+)/)
    if (!titleMatch) continue
    const title = titleMatch[1].replace(/`/g, '').trim()
    if (title.length < 3 || /prompt library|anthropic|category/i.test(title)) continue

    const systemMatch = block.match(/\*\*System:\*\*\s*\n([\s\S]*?)(?=\*\*User:\*\*|$)/i)
    const userMatch = block.match(/\*\*User:\*\*\s*\n([\s\S]*?)(?=\n#{1,3}\s|$)/i)
    const system = systemMatch?.[1]?.trim()
    const user = userMatch?.[1]?.trim()
    if (!system && !user) continue

    const parts: string[] = []
    if (system) parts.push(`## System\n${system}`)
    if (user) parts.push(`## User\n${user}`)
    const content = parts.join('\n\n')
    if (content.length < 50 || seen.has(content.slice(0, 100))) continue
    seen.add(content.slice(0, 100))

    const folder = title.replace(/[^a-zA-Z0-9]+/g, '')
    results.push({
      title,
      folder,
      system,
      user,
      content,
      sourceUrl: ANTHROPIC_LIBRARY_URL,
    })
  }

  return results
}

export async function fetchAnthropicPromptLibrary(live = false): Promise<AnthropicFetchResult> {
  if (live) {
    const liveResult = await fetchAnthropicLive()
    if (liveResult.prompts.length) return liveResult
  }

  const mirror = await fetchAnthropicFromGitHubMirror()
  if (mirror.prompts.length) return mirror

  if (existsSync(ANTHROPIC_CACHE_FILE)) {
    try {
      const cached = JSON.parse(readFileSync(ANTHROPIC_CACHE_FILE, 'utf-8')) as AnthropicRawPrompt[]
      if (cached.length) {
        return {
          ok: true,
          method: 'cached',
          message: `Loaded ${cached.length} prompts from cache`,
          prompts: cached,
        }
      }
    } catch {
      /* ignore */
    }
  }

  return mirror.ok ? mirror : { ok: false, method: 'none', message: mirror.message, prompts: [] }
}
