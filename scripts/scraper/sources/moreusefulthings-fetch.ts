import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const MOREUSEFULTHINGS_BASE = 'https://www.moreusefulthings.com'
export const MOREUSEFULTHINGS_LIBRARY_URL = `${MOREUSEFULTHINGS_BASE}/prompts`
export const MOREUSEFULTHINGS_RAW_DIR = 'data/sources/moreusefulthings-raw'
export const MOREUSEFULTHINGS_CACHE_FILE = 'data/sources/moreusefulthings-scraped.json'
export const MOREUSEFULTHINGS_SEED_PAGE = 'data/sources/moreusefulthings-page.txt'

export const MOREUSEFULTHINGS_URLS = [
  `${MOREUSEFULTHINGS_BASE}/instructor-prompts`,
  `${MOREUSEFULTHINGS_BASE}/student-exercises`,
  `${MOREUSEFULTHINGS_BASE}/prompts`,
]

const GITHUB_RAW =
  'https://raw.githubusercontent.com/microsoft/prompts-for-edu/main'

export const GITHUB_PROMPT_FILES: Array<{ path: string; section: string }> = [
  { path: 'Educators/Prompts/Assignment Ideation for Active Learner.MD', section: 'instructor-aids' },
  { path: 'Educators/Prompts/Diagnostic Quiz Generator.MD', section: 'instructor-aids' },
  { path: 'Educators/Prompts/Explainer.MD', section: 'instructor-aids' },
  { path: 'Educators/Prompts/Individualized Student Assistance.MD', section: 'instructor-aids' },
  { path: 'Educators/Prompts/Interactive Lecture.MD', section: 'instructor-aids' },
  { path: 'Educators/Prompts/Lesson Planner.MD', section: 'instructor-aids' },
  { path: 'Students/Prompts/Devils Advocate.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Peer Teaching.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Quiz Me.md', section: 'student-exercises' },
  { path: 'Students/Prompts/Simulator.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Team Member.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Team Pre-mortem Coach.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Team Reflection Coach.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Tutor.MD', section: 'student-exercises' },
  { path: 'Students/Prompts/Writing Mentor.MD', section: 'student-exercises' },
  { path: 'Administration/Prompts/Meeting Summary.MD', section: 'other' },
]

export interface MoreUsefulThingsRaw {
  title: string
  section?: string
  description?: string
  content: string
  models?: string[]
  sourceUrl?: string
}

export interface MoreUsefulThingsFetchResult {
  ok: boolean
  method: 'firecrawl' | 'fetch' | 'github' | 'seed' | 'cached' | 'none'
  message: string
  prompts: MoreUsefulThingsRaw[]
}

function saveRaw(name: string, content: string): string {
  mkdirSync(MOREUSEFULTHINGS_RAW_DIR, { recursive: true })
  const path = join(MOREUSEFULTHINGS_RAW_DIR, name)
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

function inferModelsFromText(text: string): string[] {
  const models: string[] = []
  if (/GPT-?4|ChatGPT|OpenAI/i.test(text)) models.push('ChatGPT')
  if (/Claude|Anthropic/i.test(text)) models.push('Claude')
  if (/Gemini/i.test(text)) models.push('Gemini')
  if (/Bing/i.test(text) && !models.includes('ChatGPT')) models.push('ChatGPT')
  return models.length ? [...new Set(models)] : ['ChatGPT', 'Claude', 'Gemini']
}

function titleFromHeading(raw: string, fallback: string): string {
  const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim()
  if (h1) return h1.replace(/^Instructional Coach:\s*/i, '').trim()
  return fallback.replace(/\.(MD|md)$/, '').replace(/-/g, ' ')
}

function extractPurpose(raw: string): string | undefined {
  const m = raw.match(/\*\*Purpose:\*\*\s*\n\n([\s\S]*?)(?=\n\n\||\n## )/)
  return m?.[1]?.trim()
}

function extractFirstPromptBlock(raw: string): string | null {
  const promptSection = raw.match(/## Prompt:[\s\S]*?(?=## Example|\n## [^P]|$)/i)?.[0]
  const searchIn = promptSection ?? raw
  const blocks = [...searchIn.matchAll(/```\n?([\s\S]*?)```/g)]
  for (const b of blocks) {
    const content = b[1].trim()
    if (content.length >= 80 && !content.startsWith('I want you to act as a friendly teacher who knows the subject of science'))
      return content
  }
  if (blocks[0]) return blocks[0][1].trim()
  const youAre = raw.match(/You are[\s\S]{80,12000}?(?=\n## |\n---|\n~~~|$)/)?.[0]
  return youAre?.trim() ?? null
}

/** Parse Microsoft prompts-for-edu markdown (Mollick educational prompts) */
export function parseMicrosoftPromptMd(
  raw: string,
  fileName: string,
  section: string,
  sourceUrl = MOREUSEFULTHINGS_LIBRARY_URL
): MoreUsefulThingsRaw | null {
  const content = extractFirstPromptBlock(raw)
  if (!content || content.length < 50) return null

  const title = titleFromHeading(raw, fileName)
  const description = extractPurpose(raw)

  return {
    title,
    section,
    description,
    content,
    models: inferModelsFromText(raw),
    sourceUrl,
  }
}

/** Parse Simulation Creator from More Useful Things / System-Prompt-Library export */
export function parseSimulationCreatorMd(raw: string): MoreUsefulThingsRaw | null {
  const copyBlock = raw.match(/## Copy This Prompt\s*\n~~~\n([\s\S]*?)~~~/i)?.[1]?.trim()
  const promptBlock = raw.match(/## Prompt\s*\n[\s\S]*?\n\n([\s\S]*?)(?=\n## Copy|\n## Additional)/i)?.[1]?.trim()
  const content = copyBlock ?? promptBlock?.replace(/\*\*Mollick[\s\S]*?<br>\s*/i, '').trim()
  if (!content || content.length < 100) return null

  return {
    title: 'Simulation Creator',
    section: 'instructor-aids',
    description:
      'Craft interactive AI-driven role-playing simulations for students to practice skills like negotiations, hiring, and pitching. From Ethan & Lilach Mollick, More Useful Things.',
    content,
    models: ['ChatGPT', 'Gemini'],
    sourceUrl: `${MOREUSEFULTHINGS_BASE}/instructor-prompts`,
  }
}

/** Parse More Useful Things listing page (markdown or HTML text) */
export function parseMoreUsefulThingsPage(
  raw: string,
  pageUrl: string,
  defaultSection: string
): MoreUsefulThingsRaw[] {
  const prompts: MoreUsefulThingsRaw[] = []
  const section =
    pageUrl.includes('student') ? 'student-exercises' : pageUrl.includes('instructor') ? 'instructor-aids' : defaultSection

  const blocks = raw.match(/You are[\s\S]{80,12000}?(?=(?:\n#{1,3}\s|\nYou are|\n---|\n\n\n|$))/gi) ?? []
  for (const block of blocks) {
    const cleaned = block.trim()
    if (cleaned.length < 80) continue
    const titleMatch = cleaned.match(/^You are (?:an? |the )?([^.\n]{4,70})/i)
    prompts.push({
      title: titleMatch?.[1]?.trim() ?? 'Educational Prompt',
      section,
      content: cleaned,
      models: inferModelsFromText(cleaned),
      sourceUrl: pageUrl,
    })
  }

  return prompts
}

function dedupePrompts(prompts: MoreUsefulThingsRaw[]): MoreUsefulThingsRaw[] {
  const byContent = new Map<string, MoreUsefulThingsRaw>()
  for (const p of prompts) {
    const key = p.content.slice(0, 150).toLowerCase()
    if (!byContent.has(key)) byContent.set(key, p)
  }
  return [...byContent.values()]
}

function loadLocalRawDir(): MoreUsefulThingsRaw[] {
  if (!existsSync(MOREUSEFULTHINGS_RAW_DIR)) return []
  const all: MoreUsefulThingsRaw[] = []
  const sectionByFile: Record<string, string> = {}
  for (const { path, section } of GITHUB_PROMPT_FILES) {
    sectionByFile[path.split('/').pop()!] = section
  }

  for (const file of readdirSync(MOREUSEFULTHINGS_RAW_DIR)) {
    const raw = readFileSync(join(MOREUSEFULTHINGS_RAW_DIR, file), 'utf-8')
    if (file.toLowerCase().includes('simulation')) {
      const sim = parseSimulationCreatorMd(raw)
      if (sim) all.push(sim)
      continue
    }
    const section = sectionByFile[file] ?? 'other'
    const parsed = parseMicrosoftPromptMd(raw, file, section)
    if (parsed) all.push(parsed)
  }
  return dedupePrompts(all)
}

async function fetchGithubMirror(): Promise<MoreUsefulThingsRaw[]> {
  mkdirSync(MOREUSEFULTHINGS_RAW_DIR, { recursive: true })
  const all: MoreUsefulThingsRaw[] = []

  for (const { path, section } of GITHUB_PROMPT_FILES) {
    const url = `${GITHUB_RAW}/${path.split('/').map(encodeURIComponent).join('/')}`
    const raw = await fetchText(url)
    if (!raw) continue
    saveRaw(path.split('/').pop()!, raw)
    const parsed = parseMicrosoftPromptMd(raw, path.split('/').pop()!, section, url)
    if (parsed) all.push(parsed)
  }

  const simUrl =
    'https://raw.githubusercontent.com/ncwilson78/System-Prompt-Library/main/Prompts/Teaching%20Activities/Simulation%20Creator.md'
  const simRaw = await fetchText(simUrl)
  if (simRaw) {
    saveRaw('Simulation-Creator.md', simRaw)
    const sim = parseSimulationCreatorMd(simRaw)
    if (sim) all.push(sim)
  }

  return dedupePrompts(all)
}

function loadSeedPage(): MoreUsefulThingsRaw[] {
  if (!existsSync(MOREUSEFULTHINGS_SEED_PAGE)) return []
  try {
    const raw = readFileSync(MOREUSEFULTHINGS_SEED_PAGE, 'utf-8')
    const parts = raw.split('\n\n\n')
    const all: MoreUsefulThingsRaw[] = []
    if (parts.length >= 2) {
      all.push(...parseMoreUsefulThingsPage(parts[0], MOREUSEFULTHINGS_URLS[0], 'instructor-aids'))
      all.push(...parseMoreUsefulThingsPage(parts[1], MOREUSEFULTHINGS_URLS[1], 'student-exercises'))
    } else {
      all.push(...parseMoreUsefulThingsPage(raw, MOREUSEFULTHINGS_LIBRARY_URL, 'instructor-aids'))
    }
    return dedupePrompts(all)
  } catch {
    return []
  }
}

function loadSeedJson(): MoreUsefulThingsRaw[] {
  if (!existsSync(MOREUSEFULTHINGS_CACHE_FILE)) return []
  try {
    return JSON.parse(readFileSync(MOREUSEFULTHINGS_CACHE_FILE, 'utf-8')) as MoreUsefulThingsRaw[]
  } catch {
    return []
  }
}

export async function fetchMoreUsefulThingsLive(): Promise<MoreUsefulThingsFetchResult> {
  mkdirSync(MOREUSEFULTHINGS_RAW_DIR, { recursive: true })
  const allPrompts: MoreUsefulThingsRaw[] = []

  for (const url of MOREUSEFULTHINGS_URLS) {
    const slug = url.replace(/https?:\/\//, '').replace(/[^\w.-]+/g, '-').slice(0, 60)
    const section = url.includes('student') ? 'student-exercises' : 'instructor-aids'
    const outPath = join(MOREUSEFULTHINGS_RAW_DIR, `${slug}.md`)

    runFirecrawl(`scrape "${url}" --only-main-content --wait-for 3000 -o "${outPath}"`)
    let content: string | null = null
    if (existsSync(outPath)) content = readFileSync(outPath, 'utf-8')
    if (!content) content = await fetchText(url)

    if (content && content.length > 200) {
      saveRaw(`${slug}.html`, content.slice(0, 500_000))
      allPrompts.push(...parseMoreUsefulThingsPage(content, url, section))
    }
  }

  const deduped = dedupePrompts(allPrompts)
  if (deduped.length) {
    writeFileSync(MOREUSEFULTHINGS_CACHE_FILE, JSON.stringify(deduped, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'firecrawl',
      message: `Live fetch extracted ${deduped.length} prompts from More Useful Things`,
      prompts: deduped,
    }
  }

  return {
    ok: false,
    method: 'none',
    message: `Could not reach ${MOREUSEFULTHINGS_BASE}. Using GitHub mirror/seed fallback.`,
    prompts: [],
  }
}

export async function fetchMoreUsefulThingsLibrary(live = false): Promise<MoreUsefulThingsFetchResult> {
  if (live) {
    const liveResult = await fetchMoreUsefulThingsLive()
    if (liveResult.prompts.length) return liveResult
  }

  const fromLocal = loadLocalRawDir()
  if (fromLocal.length) {
    writeFileSync(MOREUSEFULTHINGS_CACHE_FILE, JSON.stringify(fromLocal, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'seed',
      message: `Parsed ${fromLocal.length} prompts from ${MOREUSEFULTHINGS_RAW_DIR}`,
      prompts: fromLocal,
    }
  }

  const fromGithub = await fetchGithubMirror()
  if (fromGithub.length) {
    writeFileSync(MOREUSEFULTHINGS_CACHE_FILE, JSON.stringify(fromGithub, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'github',
      message: `Fetched ${fromGithub.length} prompts from microsoft/prompts-for-edu GitHub mirror`,
      prompts: fromGithub,
    }
  }

  const fromPage = loadSeedPage()
  if (fromPage.length) {
    writeFileSync(MOREUSEFULTHINGS_CACHE_FILE, JSON.stringify(fromPage, null, 2), 'utf-8')
    return {
      ok: true,
      method: 'seed',
      message: `Parsed ${fromPage.length} prompts from ${MOREUSEFULTHINGS_SEED_PAGE}`,
      prompts: fromPage,
    }
  }

  const cached = loadSeedJson()
  if (cached.length) {
    return {
      ok: true,
      method: 'cached',
      message: `Loaded ${cached.length} prompts from ${MOREUSEFULTHINGS_CACHE_FILE}`,
      prompts: cached,
    }
  }

  if (live) return fetchMoreUsefulThingsLive()

  return {
    ok: false,
    method: 'none',
    message: 'No More Useful Things data available. Add seed files or run with --live.',
    prompts: [],
  }
}
