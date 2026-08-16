import { Link } from 'react-router-dom'
import { BarChart3, Calculator, Map } from 'lucide-react'

const TOOLS = [
  { to: '/diagnostic', icon: BarChart3, title: 'Revenue Opportunity Diagnostic', desc: '9-question assessment → Revenue Intelligence Score, opportunities, and recommended project.', time: '5 min' },
  { to: '/leakage-calculator', icon: Calculator, title: 'Revenue Leakage Calculator', desc: 'Estimate annual revenue lost to slow follow-up, manual reporting, quote delays, and data reconciliation.', time: '3 min' },
  { to: '/ai-mapper', icon: Map, title: 'AI Opportunity Mapper', desc: 'Rank processes by AI automation ROI — hours saved and annual value potential.', time: '5 min' },
]

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl font-bold">Revenue Intelligence Tools</h1>
        <p className="text-slate-300">Free tools to quantify opportunities before you invest in a full audit.</p>
      </div>
      <div className="space-y-6">
        {TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to} className="flex gap-6 bg-slate-800/30 border border-slate-700 hover:border-accent rounded-xl p-6 transition group">
            <tool.icon className="text-accent group-hover:text-cta transition shrink-0" size={32} />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-semibold text-lg">{tool.title}</h2>
                <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{tool.time}</span>
              </div>
              <p className="text-sm text-slate-400">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
