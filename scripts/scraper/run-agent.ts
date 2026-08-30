#!/usr/bin/env npx tsx
/**
 * Prompt Scraper AI Agent Runner
 *
 * Implements the agent defined in agents/prompt-scraper-agent.md
 * Usage:
 *   npm run scrape
 *   npm run scrape -- --source csv --limit 50
 *   npm run scrape -- --dry-run
 */

import { scrapeAwesomePromptsCsv } from './sources'
import { loadDatabase, importPrompts, printReport } from './database'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    source: 'csv',
    limit: 100,
    dryRun: false,
    url: null as string | null,
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) options.source = args[++i]
    if (args[i] === '--limit' && args[i + 1]) options.limit = parseInt(args[++i], 10)
    if (args[i] === '--dry-run') options.dryRun = true
    if (args[i] === '--url' && args[i + 1]) options.url = args[++i]
  }

  return options
}

async function main() {
  console.log('🤖 Prompt Scraper AI Agent starting...\n')
  console.log('Agent spec: agents/prompt-scraper-agent.md\n')

  const options = parseArgs()
  const db = loadDatabase()
  console.log(`Current database: ${db.prompts.length} prompts from ${db.sources.length} sources\n`)

  if (options.source === 'csv' || options.source === 'all') {
    const scraped = await scrapeAwesomePromptsCsv(db.prompts, options.limit)
    console.log(`Extracted ${scraped.length} normalized prompts`)

    const report = importPrompts(
      db,
      scraped,
      {
        name: 'Awesome ChatGPT Prompts',
        url: 'https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv',
      },
      options.dryRun
    )

    if (options.dryRun) {
      console.log('\n[DRY RUN] No changes saved.')
      report.imported = scraped.length
    } else {
      report.totalInDatabase = db.prompts.length
    }

    printReport(report)
  }

  if (options.dryRun) {
    console.log('Dry run complete. Run without --dry-run to save.')
  } else {
    console.log(`✅ Database saved to data/prompts-db.json`)
    console.log(`   Run "npm run build:prompts" to sync with the web app.\n`)
  }
}

main().catch((err) => {
  console.error('❌ Scraper agent failed:', err.message)
  process.exit(1)
})
