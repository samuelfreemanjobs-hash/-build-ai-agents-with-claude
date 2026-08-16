import { Link } from 'react-router-dom'
import { Search, Wrench, Zap, ArrowRight } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">How Freeman Intelligence Works</h1>
        <p className="text-slate-300 text-lg">Revenue Systems Engineering — not another AI agency or consulting engagement.</p>
      </div>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Search, title: 'Find', steps: ['Revenue Opportunity Diagnostic', 'Market & competitive intelligence', 'Process and data audit', 'Revenue leakage analysis'] },
          { icon: Wrench, title: 'Fix', steps: ['Process redesign', 'Funnel and workflow optimization', 'Data integration planning', 'Quick-win automation'] },
          { icon: Zap, title: 'Build', steps: ['AI agent deployment', 'Dashboard and reporting systems', 'Website and digital experience', 'Ongoing intelligence infrastructure'] },
        ].map((phase) => (
          <div key={phase.title} className="space-y-4">
            <phase.icon className="text-accent" size={32} />
            <h2 className="text-xl font-bold">{phase.title}</h2>
            <ul className="space-y-2 text-sm text-slate-400">
              {phase.steps.map((s) => <li key={s}>• {s}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">WRIS Methodology</h2>
        <p className="text-slate-300 mb-4">
          Our Website Revenue Intelligence System (WRIS) connects market research, competitive positioning, and conversion architecture into a repeatable methodology—not a one-off project.
        </p>
        <div className="text-sm text-slate-400 space-y-1 font-mono">
          <p>WRIS Research → Blue Ocean Analysis → USP → Copy → Website Blueprint → Implementation</p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-xl font-bold mb-4">Start with the Diagnostic</h2>
        <p className="text-slate-400 mb-6">Every engagement begins with understanding where revenue is leaking and what's worth fixing first.</p>
        <Link to="/diagnostic" className="inline-flex items-center gap-2 bg-cta hover:bg-cta-dark text-navy font-semibold px-8 py-3 rounded-lg transition">
          Start Diagnostic <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
