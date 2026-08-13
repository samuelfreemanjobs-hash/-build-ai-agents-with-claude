export type PromptType = 'text' | 'image'
export type AIModel = 'ChatGPT' | 'Claude' | 'Gemini' | 'Midjourney' | 'Grok' | 'DeepSeek'

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  subcategories?: string[]
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
}

export type SortOption = 'popular' | 'recent' | 'shuffled' | 'title'

export interface FilterState {
  search: string
  category: string | null
  model: AIModel | null
  type: PromptType | null
  sort: SortOption
}
