export type PromptType = 'text' | 'image'
export type AIModel = 'ChatGPT' | 'Claude' | 'Gemini' | 'Midjourney' | 'Grok' | 'DeepSeek'

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  subcategories?: string[]
}

export interface PromptSwipe {
  id: string
  title: string
  description: string
  useCase: string
  content: string
}

export interface PromptSource {
  url: string
  name: string
  scrapedAt: string
}

export interface Prompt {
  id: string
  title: string
  emoji: string
  description: string
  content: string
  categories: string[]
  models: AIModel[]
  type: PromptType
  tags: string[]
  likes: number
  copies: number
  /** Fill-in-the-blank version with {{placeholders}} */
  fillInBlank?: string
  /** Alternative use-case variations */
  swipes?: PromptSwipe[]
  /** Collection grouping e.g. "1000-prompts" */
  collection?: string
  /** Which section within the collection */
  collectionSection?: string
  source?: PromptSource
}

export type SortOption = 'popular' | 'recent' | 'shuffled' | 'title'

export interface FilterState {
  search: string
  category: string | null
  model: AIModel | null
  type: PromptType | null
  collection: string | null
  sort: SortOption
}

export interface PromptCollection {
  id: string
  name: string
  emoji: string
  description: string
  promptCount: number
}
