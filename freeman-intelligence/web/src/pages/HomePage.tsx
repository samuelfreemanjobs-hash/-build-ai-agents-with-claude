import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Cog, Eye, Search, Wrench, Zap, Calculator, Map } from 'lucide-react'

const PAIN_AREAS = ['Leads', 'Sales', 'Follow-up', 'Quoting', 'Operations', 'Reporting', 'Retention', 'Data', 'Automation']

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-xs uppercase tracking-widest text-accent">Revenue Systems Engineering · Metro Detroit</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">Turn Your Operations Into a Revenue Engine</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Freeman Intelligence engineers AI-powered revenue systems for automotive, logistics, and industrial companies—connecting intelligence, automation, data, and digital systems to find opportunities and eliminate revenue leakage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/diagnostic" className="inline-flex items-center justify-center gap-2 bg-cta hover:bg-cta-dark text-navy font-semibold px-8 py-3 rounded-lg transition">
              Find My Revenue Opportunities <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 px-8 py-3 rounded-lg transition">
              See How It Works
            </Link>
          </div>
          <p className="text-sm text-slate-500">Built for Metro Detroit automotive suppliers, logistics operators, and industrial manufacturers.</p>
        </div>
      </section>

      {/* Problem */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Your Business Already Has More Revenue Intelligence Than You're Using</h2>
          <p className="text-slate-300">
            Your CRM, ERP, website, sales pipeline, customer data, operational systems, reports, emails, and spreadsheets contain signals. The problem is those signals are fragmented.
          </p>
          <p className="text-accent font-medium">Freeman Intelligence connects them.</p>
        </div>
      </section>

      {/* Diagnostic CTA */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Where Is Your Revenue Getting Lost?</h2>
          <p className="text-slate-300 mb-6">Take the free Revenue Opportunity Diagnostic. Get your score, top opportunities, and recommended first project in 5 minutes.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {PAIN_AREAS.map((area) => (
              <span key={area} className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full">{area}</span>
            ))}
          </div>
          <Link to="/diagnostic" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark px-6 py-3 rounded-lg font-medium transition">
            Start Diagnostic <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* The Machine */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Revenue Systems Engineering</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: 'Intelligence', items: ['Market research', 'Competitive intel', 'BI / revenue intel', 'Executive briefings'] },
              { icon: Cog, title: 'Systems', items: ['Automation', 'AI agents', 'Integrations', 'Dashboards', 'Workflows'] },
              { icon: Eye, title: 'Experience', items: ['Websites', 'Web apps', 'Interactive UX', 'Copy / CRO'] },
            ].map((col) => (
              <div key={col.title} className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                <col.icon className="text-accent mb-3" size={24} />
                <h3 className="font-semibold text-lg mb-3">{col.title}</h3>
                <ul className="space-y-1 text-sm text-slate-400">
                  {col.items.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-accent font-medium mt-8">↓ Revenue Outcomes</p>
        </div>
      </section>

      {/* Framework */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Find the Money. Fix the System. Build the Engine.</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Search, title: 'Find', desc: 'Identify revenue opportunities, inefficiencies, and market gaps' },
              { icon: Wrench, title: 'Fix', desc: 'Improve processes, funnels, data, reporting, and workflows' },
              { icon: Zap, title: 'Build', desc: 'Deploy automation, AI agents, dashboards, and intelligence systems' },
            ].map((step) => (
              <div key={step.title} className="space-y-2">
                <step.icon className="text-cta mx-auto" size={32} />
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Free Revenue Intelligence Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { to: '/diagnostic', icon: BarChart3, title: 'Revenue Opportunity Diagnostic', desc: 'Score your revenue operations maturity' },
              { to: '/leakage-calculator', icon: Calculator, title: 'Revenue Leakage Calculator', desc: 'Estimate annual revenue lost to inefficiency' },
              { to: '/ai-mapper', icon: Map, title: 'AI Opportunity Mapper', desc: 'Identify highest-ROI automation targets' },
            ].map((tool) => (
              <Link key={tool.to} to={tool.to} className="block bg-slate-800/30 border border-slate-700 hover:border-accent rounded-xl p-6 transition group">
                <tool.icon className="text-accent mb-3 group-hover:text-cta transition" size={24} />
                <h3 className="font-semibold mb-2">{tool.title}</h3>
                <p className="text-sm text-slate-400">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Built for the Metro Detroit Industrial Corridor</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {[
              { title: 'Automotive Suppliers', desc: 'Quoting, RFQs, program management, OTIF compliance, complex sales cycles' },
              { title: 'Industrial Manufacturing', desc: 'Component makers, fabrication, machinery, distributors' },
              { title: 'Logistics & Transportation', desc: '3PLs, carriers, brokers, fleet operators, cross-border logistics' },
            ].map((icp) => (
              <div key={icp.title} className="border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold mb-2">{icp.title}</h3>
                <p className="text-slate-400">{icp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Find Where Your Revenue Is Hiding</h2>
          <Link to="/diagnostic" className="inline-flex items-center gap-2 bg-cta hover:bg-cta-dark text-navy font-semibold px-8 py-3 rounded-lg transition">
            Start the Revenue Opportunity Diagnostic <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
