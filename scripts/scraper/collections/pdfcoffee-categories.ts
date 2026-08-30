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
  /** Regex to match section header in raw PDF text */
  headerPattern?: RegExp
}

export const PDFCOFFEE_COLLECTION = {
  id: '1000-prompts',
  name: '1000+ Prompts Collection',
  sourceUrl: 'https://pdfcoffee.com/1000-prompts-pdf-free.html',
  sections: [
    { id: 'image-prompts', name: 'Bing Image Prompts', emoji: '🖼️', categoryIds: ['image', 'design'], keywords: ['image', 'midjourney', 'dalle', 'visual', 'photo', 'generate an image'], headerPattern: /Bing Image Prompts/i },
    { id: 'marketing', name: 'Marketing', emoji: '📣', categoryIds: ['marketing'], keywords: ['marketing', 'brand', 'campaign', 'advertis'], headerPattern: /^Marketing Prompts/i },
    { id: 'sales', name: 'Sales', emoji: '💰', categoryIds: ['sales'], keywords: ['sales', 'pitch', 'prospect', 'deal', 'closing'], headerPattern: /^Sales Prompts/i },
    { id: 'hr', name: 'Human Resources', emoji: '👥', categoryIds: ['hr'], keywords: ['hr', 'hiring', 'recruit', 'interview', 'onboard', 'human resource'], headerPattern: /Human Resource Prompts/i },
    { id: 'finance', name: 'Finance', emoji: '💵', categoryIds: ['finance'], keywords: ['finance', 'budget', 'invest', 'accounting', 'forecast'], headerPattern: /^Finance Prompts/i },
    { id: 'coding', name: 'Coding & Technical', emoji: '💻', categoryIds: ['coding'], keywords: ['code', 'developer', 'software', 'api', 'debug', 'technical'], headerPattern: /Coding\s*\/\s*Technical/i },
    { id: 'business-coaching', name: 'Business Advisor & Coaching', emoji: '🎯', categoryIds: ['business', 'productivity'], keywords: ['business coach', 'advisor', 'startup', 'mentor'], headerPattern: /Business Advisor\s*\/\s*Coaching/i },
    { id: 'education', name: 'Education', emoji: '📚', categoryIds: ['education'], keywords: ['education', 'teach', 'course', 'lesson', 'student'], headerPattern: /Education Related Prompts/i },
    { id: 'travel', name: 'Travel & Tourism', emoji: '✈️', categoryIds: ['content', 'writing'], keywords: ['travel', 'itinerary', 'destination', 'tourism'], headerPattern: /Travel Industry/i },
    { id: 'cooking', name: 'Cooking & Food', emoji: '🍳', categoryIds: ['content', 'writing'], keywords: ['cook', 'recipe', 'food', 'chef', 'baking'], headerPattern: /Cooking\s*&\s*Food/i },
    { id: 'customer-service', name: 'Customer Service', emoji: '🎧', categoryIds: ['customer-service'], keywords: ['customer', 'support', 'service', 'complaint'], headerPattern: /Customer Service Prompts/i },
    { id: 'ecommerce', name: 'E-commerce & Shopping', emoji: '🛒', categoryIds: ['ecommerce'], keywords: ['ecommerce', 'shop', 'product', 'store', 'shopping'], headerPattern: /E-commerce/i },
    { id: 'social-entertainment', name: 'Social Media & Entertainment', emoji: '🎬', categoryIds: ['social-media', 'content'], keywords: ['entertainment', 'media', 'viral', 'movie', 'music festival'], headerPattern: /Social Media Strategy/i },
    { id: 'healthcare', name: 'Healthcare & Wellbeing', emoji: '🏥', categoryIds: ['productivity'], keywords: ['health', 'wellness', 'medical', 'fitness', 'nutrition'], headerPattern: /Healthcare\s*&\s*Wellbeing/i },
    { id: 'gaming', name: 'Gaming', emoji: '🎮', categoryIds: ['coding'], keywords: ['gaming', 'game developer', 'game engine'], headerPattern: /^Gaming Related Prompts/i },
    { id: 'legal', name: 'Legal', emoji: '⚖️', categoryIds: ['legal'], keywords: ['legal', 'law', 'contract', 'compliance', 'trademark'], headerPattern: /^Legal Related Prompts/i },
    { id: 'real-estate', name: 'Real Estate', emoji: '🏠', categoryIds: ['real-estate'], keywords: ['real estate', 'property', 'listing', 'realtor'], headerPattern: /Real Estate Related Prompts/i },
    { id: 'nonprofit', name: 'Non-profit', emoji: '🤝', categoryIds: ['business'], keywords: ['non-profit', 'nonprofit', 'charity', 'fundraising', 'volunteer'], headerPattern: /Non-profit Related Prompts/i },
    { id: 'logistics', name: 'Logistics & Supply Chain', emoji: '📦', categoryIds: ['business'], keywords: ['logistics', 'supply chain', 'warehouse', 'shipping'], headerPattern: /Logistics Related Prompts/i },
    { id: 'trading', name: 'Trading & Finance', emoji: '📈', categoryIds: ['finance'], keywords: ['trading', 'risk/reward', 'sharpe', 'derivatives'], headerPattern: /^Trading Related Prompts/i },
    { id: 'fashion', name: 'Fashion & Clothing', emoji: '👗', categoryIds: ['content'], keywords: ['fashion', 'wardrobe', 'stylist', 'outfit'], headerPattern: /Fashion\s*&\s*Clothing/i },
    { id: 'business-ideas', name: 'Business Idea Generation', emoji: '💡', categoryIds: ['business'], keywords: ['business idea', 'startup concept', 'innovation'], headerPattern: /Business Idea Generation/i },
    { id: 'insurance', name: 'Insurance & Financial Planning', emoji: '🛡️', categoryIds: ['finance'], keywords: ['insurance', 'retirement', '401', 'financial planner'], headerPattern: /Insurance and Financial Planning/i },
    { id: 'seo', name: 'SEO', emoji: '🔍', categoryIds: ['seo', 'content'], keywords: ['seo', 'search engine', 'keyword', 'backlink'], headerPattern: /Search Engine Optim/i },
    { id: 'social-media-marketing', name: 'Social Media Marketing', emoji: '📱', categoryIds: ['social-media', 'marketing'], keywords: ['social media marketing', 'instagram', 'tiktok campaign'], headerPattern: /Social Media Marketing Related/i },
    { id: 'ppc', name: 'Pay Per Click', emoji: '🖱️', categoryIds: ['marketing'], keywords: ['ppc', 'google ads', 'ctr', 'ad campaign'], headerPattern: /Pay Per Click/i },
    { id: 'web-dev', name: 'Web Development', emoji: '🌐', categoryIds: ['coding'], keywords: ['web development', 'html', 'css', 'javascript', 'bootstrap'], headerPattern: /Web Development Related Prompts/i },
    { id: 'blog-writing', name: 'Blog & Article Writing', emoji: '📝', categoryIds: ['writing', 'content'], keywords: ['blog', 'article', 'blog post'], headerPattern: /Blog or Article Writing/i },
    { id: 'email', name: 'Email Writing', emoji: '📧', categoryIds: ['email'], keywords: ['email', 'newsletter', 'outreach'], headerPattern: /Email Writing Related Prompts/i },
    { id: 'story-novel', name: 'Story & Novel Writing', emoji: '📖', categoryIds: ['writing'], keywords: ['story', 'novel', 'fiction', 'author'], headerPattern: /Story and Novel Writing/i },
    { id: 'screenplay', name: 'Script & Screenplay', emoji: '🎬', categoryIds: ['writing'], keywords: ['script', 'screenplay', 'playwriting'], headerPattern: /Script\s*\/\s*Screenplay/i },
    { id: 'copywriting', name: 'Copywriting & Proofreading', emoji: '✍️', categoryIds: ['writing', 'marketing'], keywords: ['copywriting', 'proofread', 'tagline'], headerPattern: /Copywriting\s*&\s*Proofreading/i },
    { id: 'twitter', name: 'Twitter / X', emoji: '🐦', categoryIds: ['social-media'], keywords: ['twitter', 'tweet', 'thread'], headerPattern: /Twitter Related Prompts/i },
    { id: 'youtube', name: 'YouTube', emoji: '▶️', categoryIds: ['social-media', 'content'], keywords: ['youtube', 'video title', 'thumbnail'], headerPattern: /YouTube Related Prompts/i },
    { id: 'linkedin', name: 'LinkedIn', emoji: '💼', categoryIds: ['social-media', 'hr'], keywords: ['linkedin', 'career summary', 'b2b'], headerPattern: /LinkedIn Related Prompts/i },
    { id: 'career', name: 'Job & Career Guidance', emoji: '🚀', categoryIds: ['hr'], keywords: ['career', 'resume', 'job interview', 'job market'], headerPattern: /Job\s*\/\s*Career Guidance/i },
    { id: 'poetry', name: 'Creative Writing (Poetry)', emoji: '🌸', categoryIds: ['writing'], keywords: ['poetry', 'haiku', 'sonnet', 'verse'], headerPattern: /Creative Writing Prompts\s*\(Poetry\)/i },
    { id: 'music', name: 'Creative Writing (Music)', emoji: '🎵', categoryIds: ['writing', 'content'], keywords: ['music', 'composer', 'song', 'orchestra'], headerPattern: /Creative Writing Prompts\s*\(Music\)/i },
    { id: 'rap', name: 'Creative Writing (Rap)', emoji: '🎤', categoryIds: ['writing'], keywords: ['rap', 'hip hop', 'freestyle'], headerPattern: /Creative Writing Prompts\s*\(Rap\)/i },
  ] as CollectionSection[],
}

export function getSectionById(id: string): CollectionSection | undefined {
  return PDFCOFFEE_COLLECTION.sections.find((s) => s.id === id)
}

export function matchCollectionSection(title: string, content: string, tags: string[] = []): CollectionSection {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase()
  let best = PDFCOFFEE_COLLECTION.sections[0]
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

export function matchSectionByHeader(headerText: string): CollectionSection | undefined {
  const normalized = headerText.trim()
  for (const section of PDFCOFFEE_COLLECTION.sections) {
    if (section.headerPattern?.test(normalized)) return section
  }
  return undefined
}
