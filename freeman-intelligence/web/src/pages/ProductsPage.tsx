import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const PRODUCTS = [
  {
    id: 'audit',
    name: 'Revenue Intelligence Audit',
    tagline: 'Find where money is hiding',
    description: 'Comprehensive analysis of revenue flows, sales funnel, operations, data systems, and AI readiness. Output: Revenue Opportunity Map.',
    price: 'From $2,500',
    cta: '/diagnostic',
  },
  {
    id: 'wris',
    name: 'Website Revenue Intelligence Audit',
    tagline: 'Powered by WRIS',
    description: 'Market positioning, competitive analysis, website copy/UX review, and conversion architecture. Output: Website Revenue Blueprint.',
    price: 'From $5,000',
    cta: '/diagnostic',
  },
  {
    id: 'engineering',
    name: 'Revenue Systems Engineering',
    tagline: 'Build the engine',
    description: 'CRM workflows, dashboards, AI agents, automation, websites, and system integration. Working revenue infrastructure with documented runbooks.',
    price: 'From $25,000',
    cta: '/diagnostic',
  },
  {
    id: 'infrastructure',
    name: 'Intelligence Infrastructure',
    tagline: 'Recurring intelligence layer',
    description: 'Market monitoring, competitive alerts, revenue reporting, executive briefings, opportunity detection, and KPI monitoring.',
    price: 'From $3,000/mo',
    cta: '/diagnostic',
  },
]

export default function ProductsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">Products</h1>
        <p className="text-slate-300">A ladder from diagnostic to recurring intelligence—not a menu of disconnected services.</p>
      </div>
      <div className="space-y-6">
        {PRODUCTS.map((p, i) => (
          <div key={p.id} className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-accent uppercase tracking-widest mb-1">Product {i + 1}</p>
              <h2 className="text-xl font-bold">{p.name}</h2>
              <p className="text-sm text-cta mb-2">{p.tagline}</p>
              <p className="text-slate-400 text-sm">{p.description}</p>
            </div>
            <div className="text-right space-y-3">
              <p className="text-sm text-slate-500">{p.price}</p>
              <Link to={p.cta} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark px-5 py-2 rounded-lg text-sm font-medium transition">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
