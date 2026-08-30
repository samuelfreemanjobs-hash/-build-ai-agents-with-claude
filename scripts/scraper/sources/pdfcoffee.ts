import {
  PDFCOFFEE_COLLECTION,
  matchCollectionSection,
} from '../collections/pdfcoffee-categories.ts'
import {
  generateFillInBlank,
  generateSwipes,
  generateUniqueDescription,
  generateUniqueTitle,
  rewriteForOriginality,
} from '../transform.ts'
import { slugify, inferCategories, inferModels, inferType, generateTags, isDuplicate } from '../normalize.ts'
import type { ScrapedPrompt } from '../types.ts'
import { CATEGORY_EMOJI } from '../types.ts'

const GITHUB_TREE_API =
  'https://api.github.com/repos/aj-geddes/useful-ai-prompts/git/trees/main?recursive=1'
const GITHUB_RAW = 'https://raw.githubusercontent.com/aj-geddes/useful-ai-prompts/main'

function extractPromptFromMarkdown(md: string): { title: string; content: string; tags: string[] } | null {
  const titleMatch = md.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1]?.trim()
  if (!title) return null

  const promptMatch = md.match(/## Prompt\s*\n```[\s\S]*?\n([\s\S]*?)```/m)
  if (!promptMatch) return null

  let content = promptMatch[1].trim()
  if (content.length < 80) return null

  const tagsMatch = md.match(/\*\*Tags\*\*:\s*(.+)/i)
  const tags = tagsMatch?.[1]?.split(',').map((t) => t.trim().toLowerCase()) ?? []

  return { title, content, tags }
}

async function fetchPromptFiles(limit: number): Promise<string[]> {
  console.log('Fetching file index from useful-ai-prompts (GitHub)...')
  const res = await fetch(GITHUB_TREE_API)
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

  const data = (await res.json()) as { tree: Array<{ path: string }> }
  const files = data.tree
    .map((t) => t.path)
    .filter((p) => p.startsWith('prompts/') && p.endsWith('.md') && !p.endsWith('/README.md'))

  console.log(`Found ${files.length} prompt files, taking ${limit}`)
  return files.slice(0, limit)
}

export async function scrape1000PromptsCollection(
  existingPrompts: ScrapedPrompt[] = [],
  limit = 120
): Promise<ScrapedPrompt[]> {
  const sourceMeta = {
    name: '1000+ Prompts Collection (PDFCoffee-style)',
    url: PDFCOFFEE_COLLECTION.sourceUrl,
    scrapedAt: new Date().toISOString(),
  }

  const files = await fetchPromptFiles(limit)
  const results: ScrapedPrompt[] = []
  const existingIds = new Set(existingPrompts.map((p) => p.id))

  for (const filePath of files) {
    try {
      const url = `${GITHUB_RAW}/${filePath}`
      const res = await fetch(url)
      if (!res.ok) continue

      const md = await res.text()
      const extracted = extractPromptFromMarkdown(md)
      if (!extracted) continue

      const uniqueTitle = generateUniqueTitle(extracted.title)
      const rewritten = rewriteForOriginality(extracted.content, uniqueTitle)
      const categories = inferCategories(uniqueTitle, rewritten)
      const section = matchCollectionSection(uniqueTitle, rewritten, extracted.tags)
      const type = inferType(categories, rewritten)
      const models: import('../../src/types/prompt').AIModel[] =
        type === 'image' ? ['Midjourney'] : [...inferModels(categories, rewritten)]

      let id = slugify(`${section.id}-${uniqueTitle}`)
      let suffix = 2
      while (existingIds.has(id)) {
        id = `${slugify(uniqueTitle).slice(0, 50)}-${suffix++}`
      }
      existingIds.add(id)

      const fillInBlank = generateFillInBlank(rewritten)
      const swipes = generateSwipes(id, uniqueTitle, rewritten, categories)

      const prompt: ScrapedPrompt = {
        id,
        title: uniqueTitle,
        emoji: section.emoji || CATEGORY_EMOJI[categories[0]] || '✨',
        description: generateUniqueDescription(uniqueTitle, section.name),
        content: rewritten,
        fillInBlank,
        swipes,
        categories: [...new Set([...section.categoryIds.slice(0, 1), ...categories.slice(0, 1)])],
        models: [...models],
        type,
        tags: [...new Set([...generateTags(uniqueTitle, categories), section.id, '1000-prompts', 'swipe-ready'])],
        likes: Math.floor(Math.random() * 30) + 5,
        copies: Math.floor(Math.random() * 80) + 10,
        collection: PDFCOFFEE_COLLECTION.id,
        collectionSection: section.id,
        source: sourceMeta,
      }

      if (isDuplicate(prompt, [...existingPrompts, ...results], 0.75)) continue
      results.push(prompt)

      if (results.length % 20 === 0) {
        console.log(`  Processed ${results.length} prompts...`)
      }

      await new Promise((r) => setTimeout(r, 50))
    } catch {
      continue
    }
  }

  return results
}
