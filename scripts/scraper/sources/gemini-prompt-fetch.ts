import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const GEMINI_PROMPTS_URL = 'https://ai.google.dev/gemini-api/prompts'
export const GEMINI_COOKBOOK_REPO = 'google-gemini/cookbook'
export const GEMINI_COOKBOOK_BASE = `https://raw.githubusercontent.com/${GEMINI_COOKBOOK_REPO}/main`
export const GEMINI_RAW_DIR = 'data/sources/gemini-api-prompts-raw'
export const GEMINI_CACHE_FILE = 'data/sources/gemini-api-prompts-scraped.json'
export const GEMINI_SEED_FILE = 'data/sources/gemini-api-prompts-scraped.json'

export interface GeminiRawPrompt {
  title: string
  section?: string
  description?: string
  content: string
  sourceUrl?: string
  notebook?: string
}

export interface GeminiFetchResult {
  ok: boolean
  method: 'github-cookbook' | 'firecrawl' | 'seed' | 'cached' | 'none'
  message: string
  prompts: GeminiRawPrompt[]
}

const PROMPT_VAR_RE =
  /(?:prompt|system_prompt|analyzePrompt|namePrompt|user_prompt|instruction|analyze_prompt|name_prompt|input)\s*=\s*"""([\s\S]*?)"""|(?:prompt|system_prompt)\s*=\s*"([^"\\]{40,1200})"/gi

const SKIP_CONTENT = [
  'Licensed under the Apache',
  'MODEL_ID',
  'google.genai',
  'pip install',
  'curl -o',
  '@title',
]

function saveRaw(name: string, content: string): string {
  mkdirSync(GEMINI_RAW_DIR, { recursive: true })
  const path = join(GEMINI_RAW_DIR, name)
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
        Accept: 'text/plain,text/markdown,application/json,text/html,*/*',
      },
      signal: AbortSignal.timeout(60_000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function sectionForNotebook(path: string): string {
  if (path.includes('/prompting/')) return 'prompting-techniques'
  if (/Market_a_Jet|Video|Image|Sketch|Virtual|Animated|Tag_and_caption|Book_illustration/i.test(path)) return 'multimodal'
  if (/Code|GitHub|SQL|json_capabilities/i.test(path)) return 'coding'
  if (/Story|Book|Translate|Animated/i.test(path)) return 'creative'
  return 'cookbook-examples'
}

function titleFromNotebook(path: string, content: string): string {
  const name = path
    .split('/')
    .pop()
    ?.replace('.ipynb', '')
    .replace(/_/g, ' ')
  if (name && name.length > 8) return name
  return content.split('\n')[0].slice(0, 70)
}

function shouldSkipPrompt(text: string): boolean {
  if (text.length < 40) return true
  return SKIP_CONTENT.some((s) => text.includes(s))
}

/** Extract prompts from a Jupyter notebook JSON string */
export function extractPromptsFromNotebook(
  raw: string,
  notebookPath: string
): GeminiRawPrompt[] {
  const results: GeminiRawPrompt[] = []
  let nb: { cells?: Array<{ source?: string[] }> }
  try {
    nb = JSON.parse(raw) as { cells?: Array<{ source?: string[] }> }
  } catch {
    return results
  }

  for (const cell of nb.cells ?? []) {
    const src = (cell.source ?? []).join('')
    let match: RegExpExecArray | null
    PROMPT_VAR_RE.lastIndex = 0
    while ((match = PROMPT_VAR_RE.exec(src)) !== null) {
      const text = (match[1] ?? match[2] ?? '').trim()
      if (shouldSkipPrompt(text)) continue
      results.push({
        title: titleFromNotebook(notebookPath, text),
        section: sectionForNotebook(notebookPath),
        content: text,
        sourceUrl: `https://github.com/${GEMINI_COOKBOOK_REPO}/blob/main/${notebookPath}`,
        notebook: notebookPath,
      })
    }
  }

  return results
}

/** Parse ai.google.dev prompt gallery page markdown/HTML */
export function parseGeminiGalleryPage(raw: string): GeminiRawPrompt[] {
  const results: GeminiRawPrompt[] = []

  // Gallery card titles like "### Recipe to JSON"
  const cards = raw.match(/#{2,3}\s+([^\n]+)[\s\S]*?(?=#{2,3}\s|$)/g) ?? []
  for (const card of cards) {
    const titleMatch = card.match(/#{2,3}\s+([^\n]+)/)
    const title = titleMatch?.[1]?.trim()
    if (!title || /prompt gallery|gemini api|cookbook/i.test(title)) continue

    const descMatch = card.match(/\n([^\n#]{30,300})\n/)
    const desc = descMatch?.[1]?.trim()
    if (!desc) continue

    results.push({
      title,
      section: /json|schema|structured/i.test(title + desc) ? 'structured-output' : 'prompt-gallery',
      description: desc,
      content: desc,
      sourceUrl: GEMINI_PROMPTS_URL,
    })
  }

  return results.filter((p) => p.content.length >= 40)
}

async function listCookbookNotebooks(): Promise<string[]> {
  const apiUrl = `https://api.github.com/repos/${GEMINI_COOKBOOK_REPO}/git/trees/main?recursive=1`
  const json = await fetchText(apiUrl)
  if (!json) return []
  try {
    const data = JSON.parse(json) as { tree?: Array<{ path: string }> }
    return (data.tree ?? [])
      .map((t) => t.path)
      .filter(
        (p) =>
          p.endsWith('.ipynb') &&
          (p.includes('/prompting/') || (p.startsWith('examples/') && p.split('/').length === 2))
      )
      .sort()
  } catch {
    return []
  }
}

export async function fetchGeminiFromCookbook(): Promise<GeminiFetchResult> {
  mkdirSync(GEMINI_RAW_DIR, { recursive: true })
  const paths = await listCookbookNotebooks()
  if (!paths.length) {
    return { ok: false, method: 'none', message: 'Could not list Gemini cookbook notebooks', prompts: [] }
  }

  const prompts: GeminiRawPrompt[] = []
  for (const relPath of paths) {
    const url = `${GEMINI_COOKBOOK_BASE}/${relPath}`
    const raw = await fetchText(url)
    if (!raw) continue
    saveRaw(relPath.replace(/\//g, '_'), raw.slice(0, 200_000))
    prompts.push(...extractPromptsFromNotebook(raw, relPath))
  }

  if (prompts.length) {
    writeFileSync(GEMINI_CACHE_FILE, JSON.stringify(prompts, null, 2), 'utf-8')
  }

  return {
    ok: prompts.length > 0,
    method: 'github-cookbook',
    message: `Fetched ${prompts.length} prompts from ${GEMINI_COOKBOOK_REPO} (${paths.length} notebooks)`,
    prompts,
  }
}

export async function fetchGeminiPromptsLive(): Promise<GeminiFetchResult> {
  mkdirSync(GEMINI_RAW_DIR, { recursive: true })
  const allPrompts: GeminiRawPrompt[] = []

  const outPath = join(GEMINI_RAW_DIR, 'gemini-prompts-gallery.md')
  runFirecrawl(`scrape "${GEMINI_PROMPTS_URL}" --only-main-content -o "${outPath}"`)

  let galleryContent: string | null = null
  if (existsSync(outPath)) galleryContent = readFileSync(outPath, 'utf-8')
  if (!galleryContent) galleryContent = await fetchText(GEMINI_PROMPTS_URL)

  if (galleryContent && galleryContent.length > 200) {
    saveRaw('gallery.html', galleryContent.slice(0, 500_000))
    allPrompts.push(...parseGeminiGalleryPage(galleryContent))
  }

  const cookbook = await fetchGeminiFromCookbook()
  allPrompts.push(...cookbook.prompts)

  // Dedupe
  const byContent = new Map<string, GeminiRawPrompt>()
  for (const p of allPrompts) {
    const key = p.content.slice(0, 120).toLowerCase()
    if (!byContent.has(key)) byContent.set(key, p)
  }
  const deduped = [...byContent.values()]

  if (deduped.length) {
    writeFileSync(GEMINI_CACHE_FILE, JSON.stringify(deduped, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'firecrawl',
      message: `Live fetch: ${deduped.length} prompts (gallery + cookbook)`,
      prompts: deduped,
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${GEMINI_PROMPTS_URL}. Using seed/cache fallback.`,
    prompts: [],
  }
}

function loadSeedJson(): GeminiRawPrompt[] {
  if (!existsSync(GEMINI_SEED_FILE)) return []
  try {
    return JSON.parse(readFileSync(GEMINI_SEED_FILE, 'utf-8')) as GeminiRawPrompt[]
  } catch {
    return []
  }
}

export async function fetchGeminiPromptLibrary(live = false): Promise<GeminiFetchResult> {
  if (live) {
    const liveResult = await fetchGeminiPromptsLive()
    if (liveResult.prompts.length) return liveResult
  }

  const cookbook = await fetchGeminiFromCookbook()
  if (cookbook.prompts.length >= 50) return cookbook

  const seed = loadSeedJson()
  if (seed.length) {
    return {
      ok: true,
      method: 'seed',
      message: `Loaded ${seed.length} prompts from ${GEMINI_SEED_FILE}`,
      prompts: seed,
    }
  }

  if (cookbook.prompts.length) return cookbook

  return {
    ok: false,
    method: 'none',
    message: 'No Gemini prompts available. Add seed file or run with --live.',
    prompts: [],
  }
}
