import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, DollarSign } from 'lucide-react'
import { calculateLeakage } from '../lib/leakageCalculator'

export default function LeakageCalculatorPage() {
  const [inputs, setInputs] = useState({
    annual_revenue: 10000000,
    industry: 'automotive',
    slow_followup_pct: 15,
    manual_reporting_hours: 8,
    quote_delay_days: 5,
    data_reconciliation_hours: 6,
    missed_upsell_pct: 10,
  })
  const [result, setResult] = useState<ReturnType<typeof calculateLeakage> | null>(null)

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(calculateLeakage(inputs))
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="text-cta" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Revenue Leakage Calculator</h1>
          <p className="text-slate-400 text-sm">Estimate annual revenue lost to operational inefficiency</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Annual revenue ($)</label>
          <input type="number" value={inputs.annual_revenue} onChange={(e) => setInputs({ ...inputs, annual_revenue: +e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Industry</label>
          <select value={inputs.industry} onChange={(e) => setInputs({ ...inputs, industry: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none">
            <option value="automotive">Automotive supplier</option>
            <option value="logistics">Logistics / transportation</option>
            <option value="manufacturing">Industrial manufacturing</option>
            <option value="other">Other industrial</option>
          </select>
        </div>
        {[
          { key: 'slow_followup_pct' as const, label: '% of deals lost to slow follow-up', max: 50 },
          { key: 'manual_reporting_hours' as const, label: 'Hours/week on manual reporting', max: 40 },
          { key: 'quote_delay_days' as const, label: 'Average quote delay (days beyond target)', max: 30 },
          { key: 'data_reconciliation_hours' as const, label: 'Hours/week on data reconciliation', max: 40 },
          { key: 'missed_upsell_pct' as const, label: '% of expansion revenue missed', max: 30 },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-slate-300 mb-2">{field.label}</label>
            <input type="range" min={0} max={field.max} value={inputs[field.key]}
              onChange={(e) => setInputs({ ...inputs, [field.key]: +e.target.value })}
              className="w-full accent-accent" />
            <span className="text-sm text-slate-400">{inputs[field.key]}{field.key.includes('pct') ? '%' : field.key.includes('hours') ? ' hrs' : ' days'}</span>
          </div>
        ))}
        <button type="submit" className="w-full bg-cta hover:bg-cta-dark text-navy font-semibold py-3 rounded-lg transition">Calculate Leakage</button>
      </form>

      {result && (
        <div className="mt-10 space-y-6 animate-fade-in">
          <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-8">
            <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">Estimated Annual Revenue Leakage</p>
            <p className="text-5xl font-bold text-red-400">{fmt(result.total_annual_leakage)}</p>
            <p className="text-slate-400 mt-2">{result.leakage_pct}% of annual revenue</p>
          </div>
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><DollarSign size={18} className="text-cta" /> Breakdown</h3>
            {result.breakdown.map((b) => (
              <div key={b.category} className="flex justify-between items-start border-b border-slate-700 pb-3 last:border-0">
                <div>
                  <p className="font-medium">{b.category}</p>
                  <p className="text-xs text-slate-400">{b.description}</p>
                </div>
                <p className="font-semibold text-red-400">{fmt(b.amount)}</p>
              </div>
            ))}
          </section>
          <section className="bg-accent/10 border border-accent/30 rounded-xl p-6">
            <p className="text-sm text-slate-400">Recovery potential (45% addressable)</p>
            <p className="text-2xl font-bold text-accent">{fmt(result.recovery_potential)}/year</p>
            <p className="text-sm text-slate-300 mt-2">Recommended: {result.recommended_action}</p>
          </section>
          <Link to="/diagnostic" className="block text-center text-accent hover:underline">Take the full Revenue Opportunity Diagnostic →</Link>
        </div>
      )}
    </div>
  )
}
