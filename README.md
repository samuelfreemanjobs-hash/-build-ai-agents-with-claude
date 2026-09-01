# Prompt Library

A curated AI prompt library inspired by God of Prompt — browse, search, filter, and copy engineered prompts for ChatGPT, Claude, Gemini, Midjourney, and more.

## Features

- **20+ curated prompts** across marketing, sales, SEO, coding, writing, design, business, and more
- **Browse by category** — 20 categories with emoji icons
- **Filter by AI model** — ChatGPT, Claude, Gemini, Midjourney, Grok, DeepSeek
- **Filter by type** — Text and image prompts
- **Full-text search** across titles, descriptions, tags, and prompt content
- **One-click copy** — Copy any prompt to clipboard instantly
- **Prompt detail modal** — View full prompt with metadata
- **Sort options** — Shuffled, most copied, most liked, title A-Z
- **Dark theme UI** — Modern, responsive design

## Prompt Scraper AI Agent

Automatically extract prompts from public sources into `data/prompts-db.json`.

**Agent spec:** `agents/prompt-scraper-agent.md`

```bash
npm run scrape                    # Scrape default sources (Awesome ChatGPT Prompts CSV)
npm run scrape -- --limit 200     # Scrape up to 200 prompts
npm run scrape:dry                # Preview without saving
npm run build:prompts             # Sync database → web app
```

Current library: **1,352 prompts** from scraped collections (Awesome ChatGPT Prompts, PDFCoffee 1000+, 150 Best, BONUS 3 Marketing).

> **Note:** This deployment intentionally excludes the **15-department business prompt generator** (~10k template variants on PR #23). That track stays separate until you choose to merge it.

To add Firecrawl-powered scraping (requires `FIRECRAWL_API_KEY`):

```bash
firecrawl agent "extract all AI prompts" --urls "https://example.com/prompts" --schema scripts/schemas/prompt-extraction.schema.json --wait
```

## Live demo

**URL:** https://samuelfreemanjobs-hash.github.io/-build-ai-agents-with-claude/

### Enable GitHub Pages (one-time)

The static site is already on the `gh-pages` branch. Enable Pages in repo settings:

1. Open [Settings → Pages](https://github.com/samuelfreemanjobs-hash/-build-ai-agents-with-claude/settings/pages)
2. **Source:** **Deploy from a branch** (not GitHub Actions)
3. **Branch:** `gh-pages` / **folder:** `/ (root)`
4. Save, then wait 1–2 minutes

> If you chose **GitHub Actions** as the source, the deploy workflow will run—but Pages must still be enabled first. The `gh-pages` branch option is simpler and does not require a workflow.

> **Note:** `http://localhost:5173` only works on the machine where you run `npm run dev`—not from a cloud agent link on your laptop.

## Getting Started (run on your machine)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3
- Lucide React icons

## Prompt Structure

Each prompt follows the God of Prompt engineering format:

- **Role** — Who the AI should act as
- **Context** — Variables and background (`{{placeholders}}`)
- **Task** — Specific instructions and deliverables
- **Output Format** — How results should be structured

## License

MIT
