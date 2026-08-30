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
import { scrapePdfCoffeeFromFile } from './sources/pdfcoffee-parser'
import { scrape150PromptsFromFile } from './sources/pdfcoffee-150-parser'
import { scrapeBonus3MarketingFromFile } from './sources/pdfcoffee-marketing-parser'
import { scrapeWhartonGail, WHARTON_COLLECTION } from './sources/wharton-gail-parser'
import { scrapeAnthropicPromptLibrary, ANTHROPIC_COLLECTION } from './sources/anthropic-prompt-parser'
import { scrapeGammaPromptLibrary, GAMMA_COLLECTION } from './sources/gamma-prompt-parser'
import { scrapeSnackPromptLibrary, SNACKPROMPT_COLLECTION } from './sources/snackprompt-parser'
import { scrapeGeminiPromptLibrary, GEMINI_COLLECTION } from './sources/gemini-prompt-parser'
import { scrapePromptHeroLibrary, PROMPTHERO_COLLECTION } from './sources/prompthero-parser'
import { scrapeMoreUsefulThingsLibrary, MOREUSEFULTHINGS_COLLECTION } from './sources/moreusefulthings-parser'
import { scrapeGodOfPromptLibrary, GOOFPROMPT_COLLECTION } from './sources/godofprompt-parser'
import { scrapeBusinessPromptGenerator, BUSINESS_GENERATOR_COLLECTION } from './sources/business-prompt-parser'
import { loadDatabase, importPrompts, printReport } from './database'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    source: 'pdfcoffee-text',
    limit: Infinity as number,
    dryRun: false,
    live: false,
    file: 'data/sources/1000-prompts-raw.txt',
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) options.source = args[++i]
    if (args[i] === '--limit' && args[i + 1]) options.limit = parseInt(args[++i], 10)
    if (args[i] === '--file' && args[i + 1]) options.file = args[++i]
    if (args[i] === '--dry-run') options.dryRun = true
    if (args[i] === '--live') options.live = true
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

  if (options.source === 'bonus3-marketing' || options.source === 'all') {
    const fileBonus3 = options.file.includes('bonus3') ? options.file : 'data/sources/bonus3-marketing-raw.txt'
    console.log('📚 Importing BONUS 3 AI Marketing Prompt Library...')
    console.log(`   File: ${fileBonus3}`)
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const scraped = await scrapeBonus3MarketingFromFile(fileBonus3, db.prompts, options.limit)
    console.log(`Extracted ${scraped.length} transformed prompts with swipes`)

    const report = importPrompts(
      db,
      scraped,
      {
        name: 'BONUS 3 AI Marketing Prompt Library',
        url: 'https://pdfcoffee.com/bonus-3-ai-marketing-prompt-library-pdf-free.html',
      },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === '150-prompts' || options.source === 'all') {
    const file150 = options.file.includes('150') ? options.file : 'data/sources/150-chatgpt-prompts-raw.txt'
    console.log('📚 Importing 150 Best ChatGPT Prompts (PDFCoffee)...')
    console.log(`   File: ${file150}`)
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const scraped = await scrape150PromptsFromFile(file150, db.prompts, options.limit)
    console.log(`Extracted ${scraped.length} transformed prompts with swipes`)

    const report = importPrompts(
      db,
      scraped,
      {
        name: '150 Best ChatGPT Prompts (PDFCoffee)',
        url: 'https://pdfcoffee.com/150-chatgpt-prompts-pdf-free.html',
      },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'pdfcoffee-text' || options.source === 'all') {
    console.log('📚 Importing 1000+ Prompts Collection (PDFCoffee text)...')
    console.log(`   File: ${options.file}`)
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const scraped = await scrapePdfCoffeeFromFile(options.file, db.prompts, options.limit)
    console.log(`Extracted ${scraped.length} transformed prompts with swipes`)

    const report = importPrompts(
      db,
      scraped,
      {
        name: '1000+ Prompts Collection (PDFCoffee)',
        url: 'https://pdfcoffee.com/1000-prompts-pdf-free.html',
      },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'pdfcoffee' || options.source === 'all') {
    console.log('📚 Scraping 1000+ Prompts Collection (GitHub mirror)...')
    console.log('   Source: https://pdfcoffee.com/1000-prompts-pdf-free.html')
    console.log('   (Using GitHub mirror + originality transforms + swipes)\n')

    const scraped = await scrape1000PromptsCollection(db.prompts, options.limit === Infinity ? 120 : options.limit)
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

  if (options.source === 'wharton-gail' || options.source === 'all') {
    const seedFile = options.file.includes('wharton') ? options.file : 'data/sources/wharton-gail-prompts.json'
    console.log('📚 Importing Wharton GAIL Prompt Library...')
    console.log(`   Source: ${WHARTON_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch)')
    else console.log(`   Mode: seed/cache (${seedFile})`)
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeWhartonGail({
      live: options.live,
      seedFile,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: WHARTON_COLLECTION.name, url: WHARTON_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'anthropic-prompt-library' || options.source === 'all') {
    console.log('📚 Importing Anthropic Prompt Library...')
    console.log(`   Source: ${ANTHROPIC_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch, falls back to GitHub mirror)')
    else console.log('   Mode: GitHub mirror (mikewangmax/claude-prompt-library)')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeAnthropicPromptLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: ANTHROPIC_COLLECTION.name, url: ANTHROPIC_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'gamma-prompt-library' || options.source === 'all') {
    console.log('📚 Importing Gamma Prompt Library...')
    console.log(`   Source: ${GAMMA_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch, falls back to seed/cache)')
    else console.log('   Mode: seed/cache (gamma-prompt-library-page.txt)')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeGammaPromptLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: GAMMA_COLLECTION.name, url: GAMMA_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'snackprompt' || options.source === 'all') {
    console.log('📚 Importing Snack Prompt Library...')
    console.log(`   Source: ${SNACKPROMPT_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch, falls back to seed)')
    else console.log('   Mode: seed/cache (snackprompt-prompts.json)')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeSnackPromptLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: SNACKPROMPT_COLLECTION.name, url: SNACKPROMPT_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'gemini-api-prompts' || options.source === 'all') {
    console.log('📚 Importing Gemini API Prompt Gallery...')
    console.log(`   Source: ${GEMINI_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (gallery + GitHub cookbook)')
    else console.log('   Mode: GitHub cookbook (google-gemini/cookbook) + seed')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeGeminiPromptLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: GEMINI_COLLECTION.name, url: GEMINI_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'prompthero' || options.source === 'all') {
    console.log('📚 Importing PromptHero Library...')
    console.log(`   Source: ${PROMPTHERO_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch, falls back to seed)')
    else console.log('   Mode: seed/cache (prompthero-page.txt)')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapePromptHeroLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: PROMPTHERO_COLLECTION.name, url: PROMPTHERO_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'moreusefulthings' || options.source === 'all') {
    console.log('📚 Importing More Useful Things Prompt Library...')
    console.log(`   Source: ${MOREUSEFULTHINGS_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch, falls back to GitHub mirror)')
    else console.log('   Mode: GitHub mirror (microsoft/prompts-for-edu) + local seed')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeMoreUsefulThingsLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: MOREUSEFULTHINGS_COLLECTION.name, url: MOREUSEFULTHINGS_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'godofprompt' || options.source === 'all') {
    console.log('📚 Importing God of Prompt Library...')
    console.log(`   Source: ${GOOFPROMPT_COLLECTION.sourceUrl}`)
    if (options.live) console.log('   Mode: live scrape (Firecrawl + fetch, falls back to seed)')
    else console.log('   Mode: seed/cache (godofprompt-page.txt)')
    console.log('   (Originality transforms + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeGodOfPromptLibrary({
      live: options.live,
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: GOOFPROMPT_COLLECTION.name, url: GOOFPROMPT_COLLECTION.sourceUrl },
      options.dryRun
    )

    if (!options.dryRun) report.totalInDatabase = db.prompts.length
    printReport(report)
  }

  if (options.source === 'business-generated') {
    console.log('📚 Generating Original Business Prompt Library...')
    console.log(`   Source: ${BUSINESS_GENERATOR_COLLECTION.name} (Role/Context/Task templates)`)
    console.log('   Mode: programmatic generation from 334 base tasks × audience × style variants')
    console.log('   (Original prompts + swipes + fill-in-blank)\n')

    const { prompts: scraped, method, message } = await scrapeBusinessPromptGenerator({
      existingPrompts: db.prompts,
      limit: options.limit,
    })
    console.log(`Extracted ${scraped.length} transformed prompts (${method})`)
    if (message) console.log(`   ${message}`)

    const report = importPrompts(
      db,
      scraped,
      { name: BUSINESS_GENERATOR_COLLECTION.name, url: BUSINESS_GENERATOR_COLLECTION.sourceUrl },
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
