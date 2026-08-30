#!/usr/bin/env npx tsx
/**
 * Prompt Scraper AI Agent Runner
 * Usage:
 *   npm run scrape -- --source pdfcoffee --limit 120
 *   npm run scrape -- --source csv --limit 100
 *   npm run scrape -- --source all
 */

import { scrapeAwesomePromptsCsv } from './sources'
import { scrape1000PromptsCollection } from './sources/pdfcoffee'
import { loadDatabase, importPrompts, printReport } from './database'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    source: 'pdfcoffee',
    limit: 120,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) options.source = args[++i]
    if (args[i] === '--limit' && args[i + 1]) options.limit = parseInt(args[++i], 10)
    if (args[i] === '--dry-run') options.dryRun = true
  }

  return options
}

async function main() {
  console.log('🤖 Prompt Scraper AI Agent starting...\n')
  console.log('Agent spec: agents/prompt-scraper-agent.md\n')

  const options = parseArgs()
  const db = loadDatabase()
  if (!db.collections) db.collections = []
  console.log(`Current database: ${db.prompts.length} prompts from ${db.sources.length} sources\n`)

  if (options.source === 'pdfcoffee' || options.source === 'all') {
    console.log('📚 Scraping 1000+ Prompts Collection (PDFCoffee-style)...')
    console.log('   Source: https://pdfcoffee.com/1000-prompts-pdf-free.html')
    console.log('   (Using GitHub mirror + originality transforms + swipes)\n')

    const scraped = await scrape1000PromptsCollection(db.prompts, options.limit)
    console.log(`Extracted ${scraped.length} transformed prompts with swipes`)

    const report = importPrompts(
      db,
      scraped,
      {
        name: '1000+ Prompts Collection (PDFCoffee-style)',
        url: 'https://pdfcoffee.com/1000-prompts-pdf-free.html',
      },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

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

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
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
