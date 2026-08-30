import type { AIModel, PromptSwipe, PromptType } from '../../src/types/prompt'

export interface PromptSourceMeta {
  url: string
  name: string
  scrapedAt: string
}

export interface ScrapedPrompt {
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
  fillInBlank?: string
  swipes?: PromptSwipe[]
  collection?: string
  collectionSection?: string
  source: PromptSourceMeta
}

export interface PromptsDatabase {
  version: number
  lastUpdated: string
  collections: Array<{
    id: string
    name: string
    sourceUrl: string
    sectionCount: number
    promptCount: number
  }>
  sources: Array<{ name: string; url: string; lastScrapedAt: string; promptCount: number }>
  prompts: ScrapedPrompt[]
}

export interface ScrapeReport {
  source: string
  url: string
  found: number
  imported: number
  skipped: {
    duplicates: number
    tooShort: number
    invalid: number
  }
  totalInDatabase: number
}

export type RawPromptRow = {
  act: string
  prompt: string
  for_devs?: string
  type?: string
  contributor?: string
}

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  coding: ['developer', 'code', 'programming', 'terminal', 'linux', 'python', 'javascript', 'sql', 'debug', 'software', 'engineer', 'git', 'api', 'regex', 'devops', 'solidity', 'blockchain', 'technical'],
  writing: ['writer', 'translate', 'essay', 'story', 'novel', 'poem', 'copywriter', 'editor', 'proofread', 'grammar', 'literary', 'author', 'blog', 'screenplay', 'script'],
  marketing: ['marketing', 'advertis', 'campaign', 'brand', 'social media manager', 'influencer', 'seo specialist'],
  seo: ['seo', 'search engine', 'keyword', 'backlink', 'meta description'],
  sales: ['sales', 'sell', 'pitch', 'deal', 'negotiat', 'cold call', 'prospect'],
  hr: ['interview', 'job', 'hire', 'recruit', 'hr', 'career', 'resume', 'cv', 'onboard'],
  education: ['teacher', 'tutor', 'lesson', 'course', 'student', 'learn', 'education', 'professor', 'academic'],
  business: ['business', 'startup', 'entrepreneur', 'consultant', 'strategy', 'ceo', 'manager', 'advisor'],
  finance: ['finance', 'accounting', 'invest', 'stock', 'budget', 'financial', 'tax', 'crypto trader'],
  legal: ['lawyer', 'legal', 'contract', 'attorney', 'law', 'compliance'],
  design: ['design', 'ui', 'ux', 'graphic', 'logo', 'illustrat'],
  'customer-service': ['customer service', 'support', 'help desk', 'complaint'],
  ecommerce: ['ecommerce', 'e-commerce', 'product listing', 'shopify', 'amazon', 'store'],
  email: ['email', 'newsletter', 'mail', 'outreach'],
  'social-media': ['twitter', 'instagram', 'tiktok', 'linkedin', 'social media', 'thread', 'youtube'],
  content: ['content', 'youtube', 'video script', 'podcast', 'blog'],
  podcast: ['podcast', 'audio', 'episode'],
  productivity: ['productivity', 'planner', 'organiz', 'time management', 'assistant', 'coach', 'motivat'],
  'real-estate': ['real estate', 'property', 'realtor', 'housing', 'listing'],
  image: ['midjourney', 'dalle', 'stable diffusion', 'image generat', 'illustration prompt'],
}

export const CATEGORY_EMOJI: Record<string, string> = {
  coding: '💻', writing: '✍️', marketing: '📣', seo: '🔍', sales: '💰',
  hr: '👥', education: '📚', business: '📊', finance: '💵', legal: '⚖️',
  design: '🎨', 'customer-service': '🎧', ecommerce: '🛒', email: '📧',
  'social-media': '📱', content: '📝', podcast: '🎙️', productivity: '⚡',
  'real-estate': '🏠', image: '🖼️',
}

export const DEFAULT_MODELS: AIModel[] = ['ChatGPT', 'Claude', 'Gemini']
