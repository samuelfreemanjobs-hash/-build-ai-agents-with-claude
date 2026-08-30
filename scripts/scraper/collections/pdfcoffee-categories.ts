/**
 * Category structure mirroring the "1000+ AI Prompts" PDF (PDFCoffee source).
 * Maps collection sections → our internal category IDs.
 */
export interface CollectionSection {
  id: string
  name: string
  emoji: string
  categoryIds: string[]
  keywords: string[]
}

export const PDFCOFFEE_COLLECTION = {
  id: '1000-prompts',
  name: '1000+ Prompts Collection',
  sourceUrl: 'https://pdfcoffee.com/1000-prompts-pdf-free.html',
  sections: [
    { id: 'image-prompts', name: 'Image Generation', emoji: '🖼️', categoryIds: ['image', 'design'], keywords: ['image', 'midjourney', 'dalle', 'visual', 'photo'] },
    { id: 'marketing', name: 'Marketing', emoji: '📣', categoryIds: ['marketing'], keywords: ['marketing', 'brand', 'campaign', 'advertis'] },
    { id: 'sales', name: 'Sales', emoji: '💰', categoryIds: ['sales'], keywords: ['sales', 'pitch', 'prospect', 'deal', 'closing'] },
    { id: 'hr', name: 'Human Resources', emoji: '👥', categoryIds: ['hr'], keywords: ['hr', 'hiring', 'recruit', 'interview', 'onboard'] },
    { id: 'finance', name: 'Finance', emoji: '💵', categoryIds: ['finance'], keywords: ['finance', 'budget', 'invest', 'accounting', 'forecast'] },
    { id: 'coding', name: 'Coding & Technical', emoji: '💻', categoryIds: ['coding'], keywords: ['code', 'developer', 'software', 'api', 'debug', 'technical'] },
    { id: 'business', name: 'Business & Startups', emoji: '📊', categoryIds: ['business'], keywords: ['business', 'startup', 'strategy', 'founder', 'venture'] },
    { id: 'education', name: 'Education', emoji: '📚', categoryIds: ['education'], keywords: ['education', 'teach', 'course', 'lesson', 'student'] },
    { id: 'customer-service', name: 'Customer Service', emoji: '🎧', categoryIds: ['customer-service'], keywords: ['customer', 'support', 'service', 'complaint', 'ticket'] },
    { id: 'ecommerce', name: 'E-commerce', emoji: '🛒', categoryIds: ['ecommerce'], keywords: ['ecommerce', 'shop', 'product', 'store', 'cart'] },
    { id: 'social-media', name: 'Social Media', emoji: '📱', categoryIds: ['social-media'], keywords: ['social', 'twitter', 'instagram', 'tiktok', 'linkedin', 'youtube'] },
    { id: 'seo', name: 'SEO & Content', emoji: '🔍', categoryIds: ['seo', 'content'], keywords: ['seo', 'search', 'keyword', 'blog', 'article'] },
    { id: 'writing', name: 'Writing & Copy', emoji: '✍️', categoryIds: ['writing'], keywords: ['writing', 'copy', 'story', 'novel', 'screenplay', 'script'] },
    { id: 'email', name: 'Email & Outreach', emoji: '📧', categoryIds: ['email'], keywords: ['email', 'newsletter', 'outreach', 'sequence'] },
    { id: 'legal', name: 'Legal', emoji: '⚖️', categoryIds: ['legal'], keywords: ['legal', 'law', 'contract', 'compliance'] },
    { id: 'real-estate', name: 'Real Estate', emoji: '🏠', categoryIds: ['real-estate'], keywords: ['real estate', 'property', 'listing', 'realtor'] },
    { id: 'productivity', name: 'Productivity & Coaching', emoji: '⚡', categoryIds: ['productivity'], keywords: ['productivity', 'coach', 'habit', 'goal', 'plan'] },
  ] as CollectionSection[],
}

export function matchCollectionSection(title: string, content: string, tags: string[] = []): CollectionSection {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase()
  let best = PDFCOFFEE_COLLECTION.sections[PDFCOFFEE_COLLECTION.sections.length - 1]
  let bestScore = 0

  for (const section of PDFCOFFEE_COLLECTION.sections) {
    const score = section.keywords.filter((kw) => text.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      best = section
    }
  }
  return best
}
