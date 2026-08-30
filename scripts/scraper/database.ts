import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { PromptsDatabase, ScrapedPrompt, ScrapeReport } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DB_PATH = join(__dirname, '../../data/prompts-db.json')

export function loadDatabase(): PromptsDatabase {
  if (!existsSync(DB_PATH)) {
    return {
      version: 2,
      lastUpdated: new Date().toISOString(),
      collections: [],
      sources: [],
      prompts: [],
    }
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8')) as PromptsDatabase
}

export function saveDatabase(db: PromptsDatabase): void {
  mkdirSync(dirname(DB_PATH), { recursive: true })
  db.lastUpdated = new Date().toISOString()
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

export function importPrompts(
  db: PromptsDatabase,
  newPrompts: ScrapedPrompt[],
  sourceMeta: { name: string; url: string },
  dryRun = false
): ScrapeReport {
  const existingIds = new Set(db.prompts.map((p) => p.id))
  const toImport: ScrapedPrompt[] = []
  let duplicates = 0
  let tooShort = 0
  let invalid = 0

  for (const prompt of newPrompts) {
    if (!prompt.title || !prompt.content) {
      invalid++
      continue
    }
    if (prompt.content.length < 50) {
      tooShort++
      continue
    }
    if (existingIds.has(prompt.id) || db.prompts.some((p) => p.title.toLowerCase() === prompt.title.toLowerCase())) {
      duplicates++
      continue
    }
    toImport.push(prompt)
    existingIds.add(prompt.id)
  }

  if (!dryRun && toImport.length > 0) {
    db.prompts.push(...toImport)

    const collectionIds = [...new Set(toImport.map((p) => p.collection).filter(Boolean))]
    for (const collId of collectionIds) {
      const count = toImport.filter((p) => p.collection === collId).length
      const existing = db.collections?.find((c) => c.id === collId)
      if (existing) {
        existing.promptCount += count
      } else if (db.collections) {
        db.collections.push({
          id: collId!,
          name:
            collId === '1000-prompts'
              ? '1000+ Prompts Collection'
              : collId === '150-chatgpt-prompts'
                ? '150 Best ChatGPT Prompts'
                : collId === 'bonus3-marketing'
                  ? 'BONUS 3 AI Marketing Prompt Library'
                  : collId === 'wharton-gail'
                    ? 'Wharton GAIL Prompt Library'
                    : collId!,
          sourceUrl: sourceMeta.url,
          sectionCount: new Set(toImport.filter((p) => p.collection === collId).map((p) => p.collectionSection)).size,
          promptCount: count,
        })
      }
    }
    if (!db.collections) db.collections = []

    const existingSource = db.sources.find((s) => s.url === sourceMeta.url)
    if (existingSource) {
      existingSource.lastScrapedAt = new Date().toISOString()
      existingSource.promptCount += toImport.length
    } else {
      db.sources.push({
        name: sourceMeta.name,
        url: sourceMeta.url,
        lastScrapedAt: new Date().toISOString(),
        promptCount: toImport.length,
      })
    }

    saveDatabase(db)
  }

  return {
    source: sourceMeta.name,
    url: sourceMeta.url,
    found: newPrompts.length,
    imported: toImport.length,
    skipped: { duplicates, tooShort, invalid },
    totalInDatabase: dryRun ? db.prompts.length : db.prompts.length,
  }
}

export function printReport(report: ScrapeReport): void {
  console.log('\n## Scrape Report')
  console.log(`- Source: ${report.source} (${report.url})`)
  console.log(`- Found: ${report.found} prompts`)
  console.log(`- Imported: ${report.imported} new prompts`)
  console.log(
    `- Skipped: ${report.skipped.duplicates + report.skipped.tooShort + report.skipped.invalid} (duplicates: ${report.skipped.duplicates}, too short: ${report.skipped.tooShort}, invalid: ${report.skipped.invalid})`
  )
  console.log(`- Database total: ${report.totalInDatabase} prompts\n`)
}
