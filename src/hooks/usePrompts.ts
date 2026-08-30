import { useMemo, useState } from 'react'
import { prompts } from '../data/prompts'
import type { AIModel, FilterState, Prompt, PromptType, SortOption } from '../types/prompt'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function usePrompts(filters: FilterState) {
  const filteredPrompts = useMemo(() => {
    let result = [...prompts]

    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.content.toLowerCase().includes(query) ||
          p.fillInBlank?.toLowerCase().includes(query)
      )
    }

    if (filters.category) {
      result = result.filter((p) => p.categories.includes(filters.category!))
    }

    if (filters.model) {
      result = result.filter((p) => p.models.includes(filters.model!))
    }

    if (filters.type) {
      result = result.filter((p) => p.type === filters.type)
    }

    if (filters.collection) {
      result = result.filter((p) => p.collection === filters.collection)
    }

    switch (filters.sort) {
      case 'popular':
        result.sort((a, b) => b.copies - a.copies)
        break
      case 'recent':
        result.sort((a, b) => b.likes - a.likes)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'shuffled':
        result = shuffleArray(result)
        break
    }

    return result
  }, [filters])

  const collectionCount = prompts.filter((p) => p.collection === '1000-prompts').length

  return { prompts: filteredPrompts, totalCount: prompts.length, collectionCount }
}

export function useCopyPrompt() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyText = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopiedText(text)
    if (id) setCopiedId(id)
    setTimeout(() => {
      setCopiedText(null)
      setCopiedId(null)
    }, 2000)
  }

  const copyPrompt = (prompt: Prompt) => copyText(prompt.content, prompt.id)

  return { copiedId, copiedText, copyPrompt, copyText }
}

export const defaultFilters: FilterState = {
  search: '',
  category: null,
  model: null,
  type: null,
  collection: null,
  sort: 'shuffled',
}

export type { AIModel, PromptType, SortOption }
