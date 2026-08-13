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
          p.content.toLowerCase().includes(query)
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

  return { prompts: filteredPrompts, totalCount: prompts.length }
}

export function useCopyPrompt() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopiedId(prompt.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = prompt.content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(prompt.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return { copiedId, copyPrompt }
}

export const defaultFilters: FilterState = {
  search: '',
  category: null,
  model: null,
  type: null,
  sort: 'shuffled',
}

export type { AIModel, PromptType, SortOption }
