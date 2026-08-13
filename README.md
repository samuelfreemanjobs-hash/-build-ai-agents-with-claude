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

## Live demo

After deployment, the app is available at:

**https://samuelfreemanjobs-hash.github.io/-build-ai-agents-with-claude/**

(GitHub Pages deploys automatically on push to `main` or `cursor/prompt-library-3a2e`.)

> **Note:** If an agent told you to open `http://localhost:5173`, that only works on the machine where the server is running. On your computer, run the commands below locally — or use the live demo link above.

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
