import type { RawPromptRow, ScrapedPrompt } from './types'
import { isDuplicate, normalizeCsvRow } from './normalize'

const AWESOME_PROMPTS_CSV =
  'https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv'

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

function parseCsv(content: string): RawPromptRow[] {
  const lines = content.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const rows: RawPromptRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = fields[idx]?.trim() ?? ''
    })

    if (row.act && row.prompt) {
      rows.push({
        act: row.act,
        prompt: row.prompt,
        for_devs: row.for_devs,
        type: row.type,
        contributor: row.contributor,
      })
    }
  }

  return rows
}

export async function scrapeAwesomePromptsCsv(
  existingPrompts: ScrapedPrompt[] = [],
  limit = 100
): Promise<ScrapedPrompt[]> {
  console.log(`Fetching: ${AWESOME_PROMPTS_CSV}`)
  const response = await fetch(AWESOME_PROMPTS_CSV)
  if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`)

  const csv = await response.text()
  const rows = parseCsv(csv)
  console.log(`Parsed ${rows.length} rows from CSV`)

  const source = {
    name: 'Awesome ChatGPT Prompts',
    url: AWESOME_PROMPTS_CSV,
    scrapedAt: new Date().toISOString(),
  }

  const existingIds = new Set(existingPrompts.map((p) => p.id))
  const results: ScrapedPrompt[] = []

  for (const row of rows.slice(0, limit)) {
    const normalized = normalizeCsvRow(row, source, existingIds)
    if (!normalized) continue
    if (isDuplicate(normalized, [...existingPrompts, ...results])) continue
    results.push(normalized)
  }

  return results
}

export async function scrapeUrl(url: string): Promise<string> {
  console.log(`Fetching: ${url}`)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'PromptLibraryScraper/1.0 (+https://github.com/prompt-library)' },
  })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}
