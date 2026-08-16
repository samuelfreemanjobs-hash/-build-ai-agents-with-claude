import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Map, Zap } from 'lucide-react'
import { PROCESSES, mapAIOpportunities } from '../lib/aiOpportunityMapper'

export default function AIMapperPage() {
  const [inputs, setInputs] = useState(
    PROCESSES.map((p) => ({ id: p.id, hours_per_week: 0, automation_readiness: 3 }))
  )
  const [result, setResult] = useState<ReturnType<typeof mapAIOpportunities> | null>(null)

  const updateProcess = (id: string, field: 'hours_per_week' | 'automation_readiness', value: number) => {
    setInputs(inputs.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleMap = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(mapAIOpportunities(inputs))
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Map className="text-cta" size={28} />
        <div>
          <h1 className="text-2xl font-bold">AI Opportunity Mapper</h1>
          <p className="text-slate-400 text-sm">Identify processes where AI automation produces the greatest economic impact</p>
        </div>
      </div>

      <form onSubmit={handleMap} className="space-y-6">
        {PROCESSES.map((proc) => {
          const input = inputs.find((p) => p.id === proc.id)!
          return (
            <div key={proc.id} className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="font-semibold">{proc.label}</h3>
                <p className="text-xs text-slate-400">{proc.description}</p>
              </div>
              <div>
                <label className="text-sm text-slate-300">Hours per week: {input.hours_per_week}</label>
                <input type="range" min={0} max={40} value={input.hours_per_week}
                  onChange={(e) => updateProcess(proc.id, 'hours_per_week', +e.target.value)}
                  className="w-full accent-accent" />
              </div>
              {input.hours_per_week > 0 && (
                <div>
                  <label className="text-sm text-slate-300">Automation readiness: {input.automation_readiness}/5</label>
                  <input type="range" min={1} max={5} value={input.automation_readiness}
                    onChange={(e) => updateProcess(proc.id, 'automation_readiness', +e.target.value)}
                    className="w-full accent-cta" />
                </div>
              )}
            </div>
          )
        })}
        <button type="submit" className="w-full bg-cta hover:bg-cta-dark text-navy font-semibold py-3 rounded-lg transition">Map AI Opportunities</button>
      </form>

      {result && result.opportunities.length > 0 && (
        <div className="mt-10 space-y-6 animate-fade-in">
          <div className="text-center bg-accent/10 border border-accent/30 rounded-xl p-8">
            <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">Total Annual Value Potential</p>
            <p className="text-4xl font-bold text-accent">{fmt(result.total_annual_value)}</p>
          </div>
          {result.opportunities.map((opp, i) => (
            <div key={opp.process} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-accent">#{i + 1}</span> {opp.label}
                </h3>
                <span className="text-sm bg-slate-700 px-2 py-0.5 rounded">Impact: {opp.impact_score}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div><span className="text-slate-400">Hours saved/year:</span> {opp.annual_hours_saved}</div>
                <div><span className="text-slate-400">Value:</span> <span className="text-cta">{fmt(opp.annual_value)}</span></div>
              </div>
              <p className="text-sm text-slate-300 flex gap-2"><Zap size={14} className="text-cta shrink-0 mt-0.5" />{opp.recommendation}</p>
            </div>
          ))}
          <Link to="/diagnostic" className="block text-center text-accent hover:underline">Get a full Revenue Intelligence assessment →</Link>
        </div>
      )}
    </div>
  )
}
