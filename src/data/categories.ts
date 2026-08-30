import type { Category } from '../types/prompt'

export const categories: Category[] = [
  { id: 'marketing', name: 'Marketing', icon: '📣', description: 'Campaigns, ads, and brand messaging' },
  { id: 'sales', name: 'Sales', icon: '💰', description: 'Outreach, proposals, and closing' },
  { id: 'seo', name: 'SEO', icon: '🔍', description: 'Search optimization and content strategy' },
  { id: 'coding', name: 'Coding', icon: '💻', description: 'Development, debugging, and architecture' },
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'Articles, copy, and storytelling' },
  { id: 'design', name: 'Design', icon: '🎨', description: 'UI/UX, visuals, and creative direction' },
  { id: 'business', name: 'Business', icon: '📊', description: 'Strategy, planning, and operations' },
  { id: 'finance', name: 'Finance', icon: '💵', description: 'Analysis, forecasting, and reporting' },
  { id: 'hr', name: 'HR', icon: '👥', description: 'Hiring, onboarding, and culture' },
  { id: 'legal', name: 'Legal', icon: '⚖️', description: 'Contracts, compliance, and policies' },
  { id: 'customer-service', name: 'Customer Service', icon: '🎧', description: 'Support, retention, and satisfaction' },
  { id: 'ecommerce', name: 'E-commerce', icon: '🛒', description: 'Product listings, conversions, and stores' },
  { id: 'education', name: 'Education', icon: '📚', description: 'Courses, lessons, and learning materials' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', description: 'Workflows, automation, and focus' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠', description: 'Listings, market analysis, and client comms' },
  { id: 'social-media', name: 'Social Media', icon: '📱', description: 'Posts, threads, and engagement' },
  { id: 'email', name: 'Email', icon: '📧', description: 'Sequences, newsletters, and outreach' },
  { id: 'content', name: 'Content', icon: '📝', description: 'Ideation, analysis, and repurposing' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', description: 'Scripts, outlines, and show planning' },
  { id: 'image', name: 'Image Generation', icon: '🖼️', description: 'Midjourney and visual AI prompts' },
]

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
