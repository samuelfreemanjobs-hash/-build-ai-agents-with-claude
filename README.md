# Logistics Marketing System Factory

A factory-pattern application that generates complete marketing systems for logistics businesses. Configure your business profile and the factory assembles brand identity, website architecture, email sequences, content calendars, lead funnels, SEO plans, channel playbooks, KPI frameworks, sales enablement, and a 16-week implementation roadmap.

## What It Generates

| Subsystem | Output |
|-----------|--------|
| **Brand Identity** | Taglines, value propositions, positioning, tone of voice, brand colors |
| **Website Architecture** | 6 page copy sets, navigation structure, SEO meta tags |
| **Email Sequences** | Lead nurture (5 emails), onboarding (4 emails), win-back (2 emails) |
| **Content Calendar** | 4-week plan with blog topics, social posts, and email topics |
| **Lead Funnels** | Inbound quote request + ABM/direct outreach funnels with lead magnets |
| **SEO Plan** | Keywords, local SEO, content pillars, technical checklist, link building |
| **Channel Playbooks** | Per-channel tactics, budgets, KPIs, and sample copy |
| **KPI Framework** | 5 categories with targets, frequency, and tooling |
| **Sales Enablement** | Pitch deck outline, proposal template, objection handlers, case study framework |
| **Implementation Roadmap** | 4-phase, 16-week execution plan with tasks and deliverables |

## Supported Business Types

- Freight Forwarding
- Last-Mile Delivery
- Warehousing & 3PL
- Fleet Management
- Cold Chain Logistics
- Customs Brokerage
- Intermodal Transport
- Courier & Express

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the factory.

## Architecture

```
src/lib/factory/
├── types.ts              # Core type definitions
├── index.ts              # Factory orchestrator & pipeline
├── templates/
│   └── business-types.ts # 8 logistics business templates
└── generators/
    ├── brand.ts          # Brand identity generator
    ├── website.ts        # Website architecture generator
    ├── email.ts          # Email sequence generator
    ├── content.ts        # Content calendar generator
    ├── campaigns.ts      # Funnels & channel playbooks
    ├── seo.ts            # SEO plan generator
    ├── analytics.ts      # KPI framework & roadmap
    └── sales.ts          # Sales enablement generator
```

The factory uses a pipeline pattern: each generator module produces one subsystem, and the orchestrator assembles them into a complete `MarketingSystem` object exportable as JSON.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)

## Export

Generated marketing systems can be exported as JSON for integration with CRMs, project management tools, or custom implementations.
