# Prompt Library — deployment track

This branch (`cursor/prompt-library-live-46d5`) is the **live prompt business** — browse, search, and copy prompts.

## Live site

**https://samuelfreemanjobs-hash.github.io/-build-ai-agents-with-claude/**

Deployed from the `gh-pages` branch (static build). Rebuild and redeploy:

```bash
npm ci
BASE_PATH=/-build-ai-agents-with-claude/ npm run build
# then push dist/ to gh-pages (see README → Live demo)
```

## What is included (1,352 prompts)

| Collection | Source |
|------------|--------|
| Awesome ChatGPT Prompts | CSV import |
| 1000+ Prompts Collection | PDFCoffee-style transform |
| 150 Best ChatGPT Prompts | PDFCoffee |
| BONUS 3 AI Marketing | 13 marketing categories |

## What is intentionally excluded

The **15-department business prompt generator** (~354 base tasks → ~10,620 variants) lives on branch `cursor/business-prompt-generator-3a2e` (PR #23). It is **not** part of this deployment.

That generator covers: Marketing, Sales, SEO, Email, Writing, Business Strategy, HR, Finance, Legal, Customer Service, E-commerce, Productivity, Social Media, Coding, Real Estate — as programmatic templates, not scraped library content.

Keep it separate until you explicitly want those templates in the library.

## Separation from agent monorepo

This branch is **not** merged into `main` with the SaaS Factory / engineering agents. It can stay as an independent deployment track or later move to a `prompt-library/` folder without pulling in agent products.

## Local dev

```bash
npm install
npm run dev
# → http://localhost:5173
```
