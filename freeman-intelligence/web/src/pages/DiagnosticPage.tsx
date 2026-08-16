import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, BarChart3, Zap, Database, Target, CheckCircle2 } from 'lucide-react'
import { AREAS, CONTEXT_QUESTIONS, SCALE_LABELS } from '../data/questions'
import { scoreDiagnostic, type DiagnosticResult } from '../lib/scorer'
import { saveBriefing } from '../lib/briefing'

type Step = 'intro' | 'context' | 'questions' | 'results' | 'briefing'

export default function DiagnosticPage() {
  const [step, setStep] = useState<Step>('intro')
  const [context, setContext] = useState<Record<string, string>>({ industry: 'automotive', company_size: 'mid' })
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [briefing, setBriefing] = useState({ name: '', email: '', company: '', phone: '' })

  const currentArea = AREAS[questionIndex]
  const progress = step === 'questions' ? ((questionIndex + 1) / AREAS.length) * 100 : 0

  const handleScoreSelect = (score: number) => {
    const updated = { ...responses, [currentArea.id]: score }
    setResponses(updated)
    if (questionIndex < AREAS.length - 1) {
      setQuestionIndex(questionIndex + 1)
    } else {
      setResult(scoreDiagnostic(updated, context.industry, context.company_size))
      setStep('results')
    }
  }

  const handleBriefingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveBriefing({
      ...briefing,
      source: 'revenue-diagnostic',
      diagnostic_score: result?.revenue_intelligence_score,
    })
    setStep('briefing')
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 40) return 'text-cta'
    return 'text-red-400'
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {step === 'intro' && (
        <div className="animate-fade-in text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm">
            <Target size={16} /> Free · 5 minutes
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">Where Is Your Revenue Getting Lost?</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Answer 9 questions about your revenue operations. Get your Revenue Intelligence Score and a recommended first project.
          </p>
          <button onClick={() => setStep('context')} className="inline-flex items-center gap-2 bg-cta hover:bg-cta-dark text-navy font-semibold px-8 py-3 rounded-lg transition">
            Start Diagnostic <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 'context' && (
        <div className="animate-fade-in space-y-8">
          <h2 className="text-2xl font-bold">Tell us about your company</h2>
          {CONTEXT_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">{q.label}</label>
              <div className="grid gap-2">
                {q.options.map((opt) => (
                  <button key={opt.value} onClick={() => setContext({ ...context, [q.id]: opt.value })}
                    className={`text-left px-4 py-3 rounded-lg border transition ${context[q.id] === opt.value ? 'border-accent bg-accent/10' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setStep('questions')} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark px-6 py-3 rounded-lg font-medium transition">
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 'questions' && currentArea && (
        <div className="animate-fade-in space-y-8">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Question {questionIndex + 1} of {AREAS.length}</span>
              <span>{currentArea.label}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{currentArea.question}</h2>
          <p className="text-slate-400 text-sm">{currentArea.description}</p>
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((score) => (
              <button key={score} onClick={() => handleScoreSelect(score)}
                className="text-left px-5 py-4 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                <span className="font-semibold text-accent mr-3">{score}</span>
                <span className="text-slate-300">{SCALE_LABELS[score]}</span>
              </button>
            ))}
          </div>
          {questionIndex > 0 && (
            <button onClick={() => setQuestionIndex(questionIndex - 1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
              <ArrowLeft size={16} /> Previous
            </button>
          )}
        </div>
      )}

      {step === 'results' && result && (
        <div className="animate-fade-in space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-widest text-slate-400">Revenue Intelligence Score</p>
            <p className={`text-7xl font-bold ${scoreColor(result.revenue_intelligence_score)}`}>{result.revenue_intelligence_score}</p>
            <p className="text-slate-400 capitalize">Maturity: {result.maturity_band}</p>
          </div>
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg"><BarChart3 size={20} className="text-accent" /> Top Revenue Opportunities</h3>
            {result.top_opportunities.map((o, i) => (
              <div key={i} className="border-l-2 border-accent pl-4">
                <p className="font-medium">{o.title}</p>
                <p className="text-sm text-slate-400">{o.description}</p>
              </div>
            ))}
          </section>
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-3">Operational Bottlenecks</h3>
            {result.top_bottlenecks.map((b, i) => <p key={i} className="text-sm text-slate-300">• {b.description}</p>)}
          </section>
          {result.ai_automation_opportunities.length > 0 && (
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="flex items-center gap-2 font-semibold mb-3"><Zap size={18} className="text-cta" /> AI Automation Opportunities</h3>
              {result.ai_automation_opportunities.map((a, i) => <p key={i} className="text-sm text-slate-300">• {a.opportunity}</p>)}
            </section>
          )}
          {result.data_reporting_gaps.length > 0 && (
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="flex items-center gap-2 font-semibold mb-3"><Database size={18} /> Data & Reporting Gaps</h3>
              {result.data_reporting_gaps.map((g, i) => <p key={i} className="text-sm text-slate-300">• {g.gap}</p>)}
            </section>
          )}
          <section className="bg-accent/10 border border-accent/30 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Recommended First Project</h3>
            <p className="text-lg">{result.recommended_first_project.name}</p>
          </section>
          <form onSubmit={handleBriefingSubmit} className="space-y-4 border-t border-slate-700 pt-8">
            <h3 className="text-xl font-bold">Get My Revenue Intelligence Briefing</h3>
            <input required placeholder="Full name" value={briefing.name} onChange={(e) => setBriefing({ ...briefing, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
            <input required type="email" placeholder="Work email" value={briefing.email} onChange={(e) => setBriefing({ ...briefing, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
            <input required placeholder="Company" value={briefing.company} onChange={(e) => setBriefing({ ...briefing, company: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
            <input placeholder="Phone (optional)" value={briefing.phone} onChange={(e) => setBriefing({ ...briefing, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
            <button type="submit" className="w-full bg-cta hover:bg-cta-dark text-navy font-semibold py-3 rounded-lg transition">Request My Briefing</button>
          </form>
        </div>
      )}

      {step === 'briefing' && (
        <div className="animate-fade-in text-center space-y-6 py-12">
          <CheckCircle2 size={64} className="text-green-400 mx-auto" />
          <h2 className="text-2xl font-bold">Briefing Request Received</h2>
          <p className="text-slate-300 max-w-md mx-auto">Thank you, {briefing.name}. We'll send your personalized Revenue Intelligence Brief within 2 business days.</p>
          <Link to="/" className="inline-block text-accent hover:underline">Return to homepage</Link>
        </div>
      )}
    </div>
  )
}
