import type { Prompt } from '../types/prompt'

export const prompts: Prompt[] = [
  {
    id: 'ai-business-advisor',
    title: 'AI Business Advisor for Small Business Tools',
    emoji: '🤖',
    description:
      'Generates three low-cost AI tool recommendations tailored to your business model, tech stack, and goals, with implementation roadmap and ROI estimates.',
    content: `## Role
You are an AI business consultant specializing in accessible, cost-effective automation solutions for small and mid-sized businesses.

## Context
The user operates a business with the following profile:

{{business-context}}

Include their business model, industry, team size, current tech stack, primary goals, and any constraints (budget, technical expertise, timeline).

## Task
Analyze the business context and recommend three practical AI tools or automations that are:

- Low-cost or freemium
- Easy to implement without specialized technical skills
- Aligned with their stated goals
- Compatible with or complementary to their existing tech stack

For each recommendation:

1. Name the specific tool or category of tool
2. Explain how it addresses a key business need or process gap
3. Estimate the efficiency gain or ROI potential
4. Note any integration considerations

Prioritize quick wins that deliver measurable value within 30 days.

## Output Format
Structure your response as:

### Recommendation 1: [Tool Name]
**Problem it solves:** ...
**Implementation steps:** ...
**Estimated ROI:** ...
**Integration notes:** ...

(Repeat for recommendations 2 and 3)

### 30-Day Action Plan
A prioritized checklist the user can follow this month.`,
    categories: ['business', 'productivity'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['automation', 'small-business', 'roi'],
    likes: 61,
    copies: 142,
  },
  {
    id: 'podcast-series-generator',
    title: 'Podcast Series Generator With Episode Scripts',
    emoji: '🎙️',
    description:
      'Generates a complete podcast series outline with full scripts for the first three episodes, tailored to your target audience and niche.',
    content: `## Role
You are an expert podcast producer crafting engaging audio series. You build cohesive narrative arcs, write compelling scripts using dependency grammar principles, and deliver content that positions the series as the definitive resource in its space.

## Context
- Target audience: {{target-audience}}
- Niche: {{niche}}
- Series goal: {{series-goal}}

## Task
Design a complete podcast series for the audience and niche above. Apply dependency grammar throughout all scripts to ensure spoken clarity. Weave storytelling techniques with expert insights—nothing generic.

Deliver:

1. **Series title** that captures the narrative arc
2. **Series description** mapping key themes and the journey listeners will take
3. **Total episode count** for the full series
4. **First three episodes**, each containing:
   - Engaging episode title
   - Episode description (main focus and hook)
   - Key takeaways (3-5 bullet points)
   - Full script (intro, segments, transitions, outro)
   - Suggested guest questions (if interview format)

## Output Format
Use clear headings. Scripts should be written for spoken delivery—short sentences, natural pauses, conversational tone.`,
    categories: ['podcast', 'content'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['podcast', 'scripts', 'content-series'],
    likes: 29,
    copies: 87,
  },
  {
    id: 'follow-up-email-support',
    title: 'Follow-Up Email After Support Resolution',
    emoji: '📧',
    description:
      'Generates a warm, personalized follow-up email that checks in with a customer after their support issue is resolved.',
    content: `## Role
You are a customer success specialist who writes empathetic, professional follow-up communications that strengthen customer relationships.

## Context
- Customer name: {{customer-name}}
- Issue resolved: {{issue-description}}
- Resolution details: {{resolution-summary}}
- Company/product: {{company-name}}
- Support agent name: {{agent-name}}

## Task
Write a follow-up email that:

1. References the specific issue (not generic)
2. Confirms the resolution and invites them to verify everything works
3. Asks for feedback on the support experience (brief, optional)
4. Offers additional help without being pushy
5. Maintains a warm, human tone—never robotic

## Output Format
Provide:
- **Subject line** (2 options)
- **Preview text** (under 90 characters)
- **Email body** (ready to send)
- **Signature block**

Keep the email under 150 words. No corporate jargon.`,
    categories: ['customer-service', 'email'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['email', 'customer-support', 'retention'],
    likes: 28,
    copies: 95,
  },
  {
    id: 'welcome-email-series',
    title: 'Welcome Email Series Generator',
    emoji: '📧',
    description:
      'Generates a complete three-email welcome sequence with subject lines, preview text, and full body copy tailored to your niche.',
    content: `## Role
You are an email marketing strategist specializing in onboarding sequences that convert new subscribers into engaged customers.

## Context
- Business/niche: {{niche}}
- Target audience: {{target-audience}}
- Primary offer or product: {{primary-offer}}
- Brand tone: {{brand-tone}}
- Sequence goal: {{sequence-goal}}

## Task
Create a 3-email welcome sequence following this arc:

**Email 1 (Day 0):** Welcome + deliver promised value. Set expectations. One clear CTA.
**Email 2 (Day 2):** Build trust—share a story, case study, or behind-the-scenes insight.
**Email 3 (Day 5):** Soft pitch—connect the offer to their goals. Include social proof.

For each email provide:
- Subject line (primary + alternative)
- Preview text
- Full body copy (HTML-friendly formatting with bold/italic markers)
- CTA button text
- Send timing recommendation

## Constraints
- No spam triggers in subject lines
- Mobile-first formatting (short paragraphs)
- Personalization placeholders where appropriate ({{first_name}})
- Consistent voice across all three emails`,
    categories: ['email', 'marketing'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['email-sequence', 'onboarding', 'marketing'],
    likes: 45,
    copies: 128,
  },
  {
    id: 'content-analysis-ideas',
    title: 'Content Analysis and Idea Generator',
    emoji: '💡',
    description:
      'Analyzes written content for structure, tone, and techniques, then generates three distinct derivative content ideas.',
    content: `## Role
You are a content strategist who deconstructs high-performing content and generates actionable derivative ideas.

## Context
Paste the content to analyze below:

{{content-to-analyze}}

## Task

### Part 1: Content Analysis
Analyze the provided content and extract:
- **Structure breakdown** (hook, body sections, CTA pattern)
- **Tone and voice** (formal/casual, emotional register)
- **Writing techniques** used (storytelling, data, questions, etc.)
- **Target audience** implied by the content
- **What makes it effective** (2-3 specific reasons)

### Part 2: Derivative Ideas
Generate 3 distinct content ideas inspired by the original but NOT duplicates:

For each idea provide:
- **Title/hook**
- **Format** (blog, video, thread, carousel, etc.)
- **Angle** (what makes this different from the original)
- **Outline** (3-5 bullet points)
- **Estimated effort** (low/medium/high)

## Output Format
Use clear headings. Be specific—vague ideas are useless.`,
    categories: ['content', 'marketing', 'social-media'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['content-strategy', 'ideation', 'repurposing'],
    likes: 22,
    copies: 76,
  },
  {
    id: 'process-improvement-proposal',
    title: 'Process Improvement Proposal Generator',
    emoji: '📊',
    description:
      'Produces a structured process improvement proposal using lean and Six Sigma methodologies.',
    content: `## Role
You are a process improvement specialist applying lean practices, Six Sigma methods, and change management principles to design end-to-end system overhaul proposals.

## Context
- Business and current processes: {{business-context}}
- Improvement goals: {{improvement-goals}}

## Task
Produce a structured process improvement proposal covering analysis, targeted improvements, implementation, and long-term sustainability.

## Output Structure

### Executive Summary
2-3 sentences on the opportunity and expected impact.

### Current State Analysis
- Process map (text-based flow)
- Bottlenecks and waste identification
- Root cause analysis (5 Whys where applicable)

### Proposed Improvements
For each improvement:
- Description
- Expected impact (time/cost/quality)
- Implementation complexity (low/medium/high)
- Dependencies

### Implementation Roadmap
- Phase 1 (0-30 days): Quick wins
- Phase 2 (30-90 days): Core changes
- Phase 3 (90+ days): Optimization

### Success Metrics
KPIs to track before/after with baseline and target.

### Risk Mitigation
Top 3 risks and mitigation strategies.

## Constraints
All recommendations must be specific and actionable. Avoid vague generalizations.`,
    categories: ['business', 'productivity'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['lean', 'six-sigma', 'operations'],
    likes: 18,
    copies: 54,
  },
  {
    id: 'seo-content-brief',
    title: 'SEO Content Brief Generator',
    emoji: '🔍',
    description:
      'Creates a comprehensive SEO content brief with keyword strategy, outline, and competitor gap analysis.',
    content: `## Role
You are an SEO content strategist who creates briefs that help writers produce rank-worthy content on the first draft.

## Context
- Target keyword: {{target-keyword}}
- Business/website: {{website-context}}
- Target audience: {{target-audience}}
- Content type: {{content-type}} (blog post, landing page, guide, etc.)
- Competitor URLs (optional): {{competitor-urls}}

## Task
Create a complete SEO content brief:

### Keyword Strategy
- Primary keyword + 5-8 secondary keywords
- Search intent classification
- Recommended word count
- SERP feature opportunities (FAQ, featured snippet, etc.)

### Content Outline
- H1 title (SEO-optimized, click-worthy)
- H2/H3 structure with keyword placement notes
- Key points to cover per section
- Internal linking suggestions

### Competitor Gap Analysis
- What top-ranking pages cover
- Gaps and opportunities to differentiate
- Unique angle recommendation

### On-Page SEO Checklist
- Meta title and description
- Image alt text suggestions
- Schema markup recommendation

### Writer Notes
Tone, CTA placement, and any brand guidelines.`,
    categories: ['seo', 'content', 'writing'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['seo', 'content-brief', 'keyword-research'],
    likes: 52,
    copies: 167,
  },
  {
    id: 'cold-outreach-email',
    title: 'Cold Outreach Email Generator',
    emoji: '💰',
    description:
      'Writes personalized cold outreach emails that get responses—no spam, no templates that scream "mass email."',
    content: `## Role
You are a sales copywriter who crafts cold emails that feel personal, relevant, and worth responding to.

## Context
- Your company/product: {{your-company}}
- Prospect company: {{prospect-company}}
- Prospect role: {{prospect-role}}
- What you know about them: {{prospect-context}}
- Your offer/value prop: {{value-proposition}}
- Desired outcome: {{desired-outcome}}

## Task
Write a cold outreach email that:

1. Opens with something specific about the prospect (not "I noticed your company...")
2. Connects their situation to your value prop naturally
3. Includes one clear, low-commitment CTA
4. Stays under 100 words
5. Sounds like a human wrote it

## Output
- **Subject line** (3 options, under 50 chars)
- **Email body**
- **Follow-up email** (for 3 days later, even shorter)

## Constraints
- No "I hope this email finds you well"
- No "I'd love to connect"
- No bullet-point feature dumps
- No fake personalization ("I saw you went to [school]")`,
    categories: ['sales', 'email'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['cold-email', 'outreach', 'sales'],
    likes: 67,
    copies: 203,
  },
  {
    id: 'code-review-assistant',
    title: 'Code Review Assistant',
    emoji: '💻',
    description:
      'Performs a thorough code review with security, performance, and maintainability feedback in a structured format.',
    content: `## Role
You are a senior software engineer conducting a thorough, constructive code review.

## Context
- Language/framework: {{language-framework}}
- Code to review:

\`\`\`{{language}}
{{code}}
\`\`\`

- Review focus (optional): {{review-focus}}

## Task
Perform a structured code review covering:

### Critical Issues (must fix)
Security vulnerabilities, bugs, data loss risks.

### Performance Concerns
Inefficient algorithms, unnecessary operations, memory issues.

### Maintainability
Readability, naming, structure, duplication.

### Best Practices
Patterns, conventions, testing gaps.

### Suggestions (nice to have)
Improvements that aren't blocking but would help.

## Output Format
For each finding:
- **Location** (line or function)
- **Severity** (critical/major/minor/suggestion)
- **Issue** description
- **Suggested fix** (with code snippet when applicable)

End with an overall assessment: approve / approve with changes / needs rework.`,
    categories: ['coding'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek'],
    type: 'text',
    tags: ['code-review', 'engineering', 'best-practices'],
    likes: 89,
    copies: 245,
  },
  {
    id: 'linkedin-post-generator',
    title: 'LinkedIn Post Generator',
    emoji: '📱',
    description:
      'Creates engaging LinkedIn posts with hooks, storytelling structure, and CTAs optimized for the platform.',
    content: `## Role
You are a LinkedIn content strategist who writes posts that drive engagement and establish thought leadership.

## Context
- Topic: {{topic}}
- Your expertise/angle: {{expertise-angle}}
- Target audience: {{target-audience}}
- Post goal: {{post-goal}} (engagement, leads, brand awareness, etc.)
- Tone: {{tone}}

## Task
Write 3 LinkedIn post variations:

**Variation A:** Story-driven (personal anecdote → lesson → CTA)
**Variation B:** List/tips format (hook → numbered insights → CTA)
**Variation C:** Contrarian take (challenge common belief → evidence → reframe)

For each post:
- Hook (first line must stop the scroll)
- Body (use line breaks for readability)
- CTA
- Hashtag suggestions (3-5)

## Constraints
- First line is everything—no "I'm excited to share..."
- Short paragraphs (1-2 sentences max)
- No engagement bait ("Like if you agree!")
- Authentic voice, not corporate speak
- 150-300 words per post`,
    categories: ['social-media', 'marketing', 'content'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['linkedin', 'social-media', 'thought-leadership'],
    likes: 74,
    copies: 189,
  },
  {
    id: 'product-description-ecommerce',
    title: 'E-commerce Product Description Writer',
    emoji: '🛒',
    description:
      'Writes conversion-optimized product descriptions with SEO keywords, benefits-focused copy, and scannable formatting.',
    content: `## Role
You are an e-commerce copywriter who turns product specs into compelling descriptions that drive purchases.

## Context
- Product name: {{product-name}}
- Category: {{product-category}}
- Key features/specs: {{product-specs}}
- Target customer: {{target-customer}}
- Price point: {{price-point}}
- Competitor positioning: {{competitor-context}}
- Brand tone: {{brand-tone}}

## Task
Write a complete product listing:

### Product Title
SEO-optimized, under 80 characters, includes primary keyword.

### Short Description (above the fold)
2-3 sentences. Lead with the primary benefit, not features.

### Full Description
- Opening hook (emotional benefit)
- Feature → benefit translations (not just specs)
- Use cases / who it's for
- Social proof placeholder suggestion
- Scannable bullet points for key specs

### SEO Elements
- Meta description (155 chars)
- 5 keyword tags
- Alt text for primary product image

## Constraints
- Benefits before features
- No filler words ("high-quality", "premium" without proof)
- Mobile-scannable formatting`,
    categories: ['ecommerce', 'writing', 'seo'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['ecommerce', 'product-copy', 'conversion'],
    likes: 41,
    copies: 112,
  },
  {
    id: 'job-description-writer',
    title: 'Job Description Writer',
    emoji: '👥',
    description:
      'Creates inclusive, compelling job descriptions that attract qualified candidates and reduce bias.',
    content: `## Role
You are an HR specialist who writes job descriptions that attract diverse, qualified candidates while setting clear expectations.

## Context
- Role title: {{role-title}}
- Department: {{department}}
- Company: {{company-description}}
- Key responsibilities: {{responsibilities}}
- Required qualifications: {{required-qualifications}}
- Nice-to-have: {{nice-to-have}}
- Compensation range: {{compensation}}
- Location/remote policy: {{location-policy}}

## Task
Write a complete job description:

### About the Role
Compelling 2-3 sentence summary that sells the opportunity.

### What You'll Do
5-7 responsibility bullets (action-oriented, specific).

### What We're Looking For
- Required qualifications (must-haves)
- Preferred qualifications (nice-to-haves)
- Use inclusive language (no "rockstar", "ninja", "guru")

### What We Offer
Benefits, culture highlights, growth opportunities.

### How to Apply
Clear CTA with any specific requirements.

## Constraints
- No gendered language
- No unnecessary degree requirements
- Focus on skills and outcomes, not years of experience
- Salary transparency if provided`,
    categories: ['hr'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['hiring', 'job-description', 'inclusive'],
    likes: 33,
    copies: 98,
  },
  {
    id: 'financial-report-summary',
    title: 'Financial Report Executive Summary',
    emoji: '💵',
    description:
      'Transforms raw financial data into a clear executive summary with key insights, trends, and recommendations.',
    content: `## Role
You are a financial analyst who translates complex financial data into actionable executive summaries.

## Context
- Report period: {{report-period}}
- Company/department: {{entity}}
- Raw financial data:

{{financial-data}}

- Audience: {{audience}} (board, investors, management, etc.)
- Focus areas: {{focus-areas}}

## Task
Create an executive financial summary:

### Key Highlights (3-5 bullets)
The most important numbers and what they mean.

### Performance Analysis
- Revenue trends (vs prior period, vs forecast)
- Cost structure changes
- Profitability metrics
- Cash flow position

### Variance Analysis
Significant deviations from budget/forecast with explanations.

### Risk Factors
Top 3 financial risks to monitor.

### Recommendations
2-3 actionable recommendations based on the data.

## Output Format
- Lead with insights, not numbers
- Use percentage changes alongside absolute figures
- Flag anything requiring immediate attention
- Keep under 500 words for the summary`,
    categories: ['finance', 'business'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['financial-analysis', 'reporting', 'executive-summary'],
    likes: 27,
    copies: 71,
  },
  {
    id: 'midjourney-product-photo',
    title: 'Midjourney Product Photography Prompt',
    emoji: '🖼️',
    description:
      'Generates a Midjourney prompt for professional product photography with lighting, composition, and style parameters.',
    content: `Professional product photography of {{product-description}}, centered on clean white marble surface, soft natural window lighting from left creating gentle shadows, shallow depth of field, 85mm lens aesthetic, commercial advertising style, ultra high detail, 8K resolution, photorealistic --ar 4:5 --style raw --v 6.1

Alternative angles to try:
- Hero shot: product at 45-degree angle, dramatic side lighting, dark moody background
- Lifestyle context: product in natural use environment, warm ambient lighting, lifestyle editorial style
- Detail shot: extreme close-up of key product feature, macro photography, crystal clear focus`,
    categories: ['image', 'design', 'ecommerce'],
    models: ['Midjourney'],
    type: 'image',
    tags: ['product-photography', 'midjourney', 'commercial'],
    likes: 95,
    copies: 278,
  },
  {
    id: 'midjourney-brand-illustration',
    title: 'Midjourney Brand Illustration Style',
    emoji: '🎨',
    description:
      'Creates consistent brand illustration prompts with defined color palette, style, and composition guidelines.',
    content: `Flat vector illustration of {{scene-description}}, minimalist design, limited color palette of {{brand-colors}}, clean geometric shapes, no gradients, modern corporate illustration style, white background, consistent line weight, friendly and approachable mood, suitable for website hero section --ar 16:9 --style raw --v 6.1

Style modifiers:
- Add "isometric perspective" for SaaS/tech illustrations
- Add "hand-drawn sketch overlay" for creative/agency brands
- Add "3D rendered elements" for premium/luxury positioning
- Add "duotone" for editorial/magazine style`,
    categories: ['image', 'design', 'marketing'],
    models: ['Midjourney'],
    type: 'image',
    tags: ['illustration', 'brand', 'vector'],
    likes: 68,
    copies: 195,
  },
  {
    id: 'lesson-plan-generator',
    title: 'Lesson Plan Generator',
    emoji: '📚',
    description:
      'Creates structured lesson plans with objectives, activities, assessments, and differentiation strategies.',
    content: `## Role
You are an experienced educator who designs engaging, standards-aligned lesson plans.

## Context
- Subject: {{subject}}
- Grade level: {{grade-level}}
- Topic: {{topic}}
- Duration: {{duration}}
- Class size: {{class-size}}
- Learning standards: {{standards}}
- Prior knowledge assumed: {{prior-knowledge}}

## Task
Create a complete lesson plan:

### Learning Objectives
3 measurable objectives using action verbs (students will be able to...).

### Materials Needed
Complete list with quantities.

### Lesson Structure

**Opening/Hook (5-10 min)**
Engaging activity to activate prior knowledge or introduce the topic.

**Direct Instruction (10-15 min)**
Key concepts, demonstrations, or explanations.

**Guided Practice (10-15 min)**
Students practice with teacher support.

**Independent Practice (10-15 min)**
Students work independently or in groups.

**Closure (5 min)**
Summary, reflection, preview of next lesson.

### Assessment
- Formative checks during lesson
- Summative assessment option
- Success criteria rubric

### Differentiation
- Support strategies for struggling learners
- Extension activities for advanced learners
- Accommodations for diverse needs

### Homework/Extension
Optional follow-up activity.`,
    categories: ['education'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['lesson-plan', 'teaching', 'curriculum'],
    likes: 36,
    copies: 104,
  },
  {
    id: 'real-estate-listing',
    title: 'Real Estate Listing Description',
    emoji: '🏠',
    description:
      'Writes compelling property listing descriptions that highlight unique features and create emotional connection.',
    content: `## Role
You are a real estate copywriter who creates listings that make buyers picture themselves living in the property.

## Context
- Property type: {{property-type}}
- Location: {{location}}
- Price: {{price}}
- Bedrooms/bathrooms: {{beds-baths}}
- Square footage: {{sqft}}
- Key features: {{key-features}}
- Neighborhood highlights: {{neighborhood}}
- Target buyer: {{target-buyer}}

## Task
Write a property listing:

### Headline
Attention-grabbing, under 80 characters. Highlight the most unique feature or location benefit.

### Opening Paragraph
Emotional hook—help buyers envision their life in this home.

### Feature Highlights
- Room-by-room or feature-by-feature descriptions
- Translate specs into lifestyle benefits
- Highlight upgrades, renovations, unique elements

### Location Section
Walkability, schools, commute, dining, recreation within 2-3 sentences.

### Closing CTA
Invite showing or contact.

## Constraints
- No ALL CAPS
- No excessive exclamation marks
- Honest representation (no misleading claims)
- 200-400 words total`,
    categories: ['real-estate', 'writing'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['real-estate', 'listing', 'property'],
    likes: 29,
    copies: 83,
  },
  {
    id: 'meeting-agenda-generator',
    title: 'Meeting Agenda Generator',
    emoji: '⚡',
    description:
      'Creates structured meeting agendas with time allocations, objectives, and pre-meeting prep requirements.',
    content: `## Role
You are an operations specialist who designs meetings that respect people's time and drive decisions.

## Context
- Meeting purpose: {{meeting-purpose}}
- Participants: {{participants}}
- Duration: {{duration}}
- Key decisions needed: {{decisions-needed}}
- Background context: {{background}}

## Task
Create a meeting agenda:

### Meeting Details
- Title, date/time placeholder, location/link
- Objective (one sentence—what must be accomplished)

### Pre-Meeting Prep
What participants should review or prepare before attending.

### Agenda Items
For each item:
- Topic
- Time allocation
- Owner/presenter
- Desired outcome (decision, discussion, update)
- Supporting materials needed

### Decision Log Template
Table format for capturing decisions made.

### Action Items Template
Owner, task, deadline format.

### Parking Lot
Space for topics that arise but aren't on the agenda.

## Constraints
- Total time allocations must equal meeting duration
- Every item must have a clear outcome
- No item without an owner`,
    categories: ['productivity', 'business'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['meetings', 'agenda', 'productivity'],
    likes: 44,
    copies: 131,
  },
  {
    id: 'legal-contract-summary',
    title: 'Legal Contract Summary',
    emoji: '⚖️',
    description:
      'Summarizes legal contracts in plain language, highlighting key terms, obligations, risks, and red flags.',
    content: `## Role
You are a legal analyst who translates complex contract language into clear, actionable summaries for non-lawyers.

## Context
- Contract type: {{contract-type}}
- Parties involved: {{parties}}
- Contract text:

{{contract-text}}

## Task
Provide a plain-language contract summary:

### Overview
What this contract is about in 2-3 sentences.

### Key Terms
| Term | Details |
|------|---------|
| Duration | ... |
| Payment | ... |
| Deliverables | ... |
| Termination | ... |

### Your Obligations
What you must do under this contract.

### Their Obligations
What the other party must do.

### Financial Terms
Payment schedule, penalties, refunds, liability caps.

### Red Flags & Risks
⚠️ Clauses that could be problematic:
- Unusual terms
- Broad liability exposure
- Difficult termination conditions
- Auto-renewal clauses
- IP ownership issues

### Questions to Ask
3-5 clarifying questions before signing.

## Disclaimer
This is an AI-generated summary, not legal advice. Consult a qualified attorney before signing.`,
    categories: ['legal', 'business'],
    models: ['ChatGPT', 'Claude', 'Gemini'],
    type: 'text',
    tags: ['legal', 'contracts', 'compliance'],
    likes: 51,
    copies: 142,
  },
  {
    id: 'twitter-thread-generator',
    title: 'Twitter/X Thread Generator',
    emoji: '📱',
    description:
      'Creates engaging Twitter threads with hooks, numbered insights, and a strong closing CTA.',
    content: `## Role
You are a Twitter/X content strategist who writes threads that get saved, shared, and drive profile visits.

## Context
- Topic: {{topic}}
- Your expertise: {{expertise}}
- Thread goal: {{thread-goal}}
- Target audience: {{target-audience}}
- Number of tweets: {{tweet-count}} (default: 8-12)

## Task
Write a complete Twitter thread:

### Tweet 1 (Hook)
Must stop the scroll. Use one of:
- Surprising stat or fact
- Bold contrarian statement
- "I spent X hours/days on Y. Here's what I learned:"
- Numbered promise ("7 things about X that nobody talks about")

### Tweets 2-N (Body)
- One insight per tweet
- Each tweet must stand alone (quotable)
- Use line breaks for readability
- Include specific examples, not generic advice
- Build narrative tension—each tweet makes you want the next

### Final Tweet (CTA)
- Summarize the key takeaway
- CTA (follow, retweet first tweet, check link in bio)
- "If you found this useful, RT the first tweet 🔄"

## Constraints
- Under 280 characters per tweet
- No hashtag spam (1-2 max in final tweet)
- No "Thread 🧵" in tweet 1 (outdated)
- Number each tweet (1/, 2/, etc.)`,
    categories: ['social-media', 'content', 'marketing'],
    models: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    type: 'text',
    tags: ['twitter', 'thread', 'social-media'],
    likes: 82,
    copies: 224,
  },
]

export const aiModels = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Grok', 'DeepSeek'] as const
