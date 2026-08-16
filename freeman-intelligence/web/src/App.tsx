import { useState } from 'react'
import { ArrowRight, ArrowLeft, BarChart3, Zap, Database, Target, CheckCircle2 } from 'lucide-react'
import { AREAS, CONTEXT_QUESTIONS, SCALE_LABELS } from './data/questions'
import { scoreDiagnostic, type DiagnosticResult } from './lib/scorer'

type Step = 'intro' | 'context' | 'questions' | 'results' | 'briefing'

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [context, setContext] = useState<Record<string, string>>({ industry: 'automotive', company_size: 'mid' })
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [briefing, setBriefing] = useState({ name: '', email: '', company: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

  const currentArea = AREAS[questionIndex]
  const progress = step === 'questions' ? ((questionIndex + 1) / AREAS.length) * 100 : 0

  const handleStart = () => setStep('context')

  const handleContextNext = () => setStep('questions')

  const handleScoreSelect = (score: number) => {
    const updated = { ...responses, [currentArea.id]: score }
    setResponses(updated)
    if (questionIndex < AREAS.length - 1) {
      setQuestionIndex(questionIndex + 1)
    } else {
      const scored = scoreDiagnostic(updated, context.industry, context.company_size)
      setResult(scored)
      setStep('results')
    }
  }

  const handleBriefingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setStep('briefing')
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 40) return 'text-cta'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Freeman Intelligence</p>
            <h1 className="text-lg font-semibold">Revenue Opportunity Diagnostic</h1>
          </div>
          <span className="text-xs text-slate-500">WRIS Phase 2</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === 'intro' && (
          <div className="animate-fade-in text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm">
              <Target size={16} /> Free · 5 minutes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Where Is Your Revenue Getting Lost?
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">
              Answer 9 questions about your revenue operations. Get your Revenue Intelligence Score,
              top opportunities, and a recommended first project — built for Metro Detroit industry.
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-slate-400 text-sm">
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Revenue Intelligence Score (0–100)</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Top 3 revenue opportunities</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> AI automation and data gap analysis</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Recommended first project</li>
            </ul>
            <button onClick={handleStart} className="inline-flex items-center gap-2 bg-cta hover:bg-cta-dark text-navy font-semibold px-8 py-3 rounded-lg transition">
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
                    <button
                      key={opt.value}
                      onClick={() => setContext({ ...context, [q.id]: opt.value })}
                      className={`text-left px-4 py-3 rounded-lg border transition ${
                        context[q.id] === opt.value
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleContextNext} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark px-6 py-3 rounded-lg font-medium transition">
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
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentArea.question}</h2>
              <p className="text-slate-400 text-sm">{currentArea.description}</p>
            </div>
            <div className="grid gap-3">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreSelect(score)}
                  className={`text-left px-5 py-4 rounded-lg border transition ${
                    responses[currentArea.id] === score
                      ? 'border-accent bg-accent/10'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="font-semibold text-accent mr-3">{score}</span>
                  <span className="text-slate-300">{SCALE_LABELS[score]}</span>
                </button>
              ))}
            </div>
            {questionIndex > 0 && (
              <button
                onClick={() => setQuestionIndex(questionIndex - 1)}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm"
              >
                <ArrowLeft size={16} /> Previous
              </button>
            )}
          </div>
        )}

        {step === 'results' && result && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <p className="text-sm uppercase tracking-widest text-slate-400">Your Revenue Intelligence Score</p>
              <p className={`text-7xl font-bold ${scoreColor(result.revenue_intelligence_score)}`}>
                {result.revenue_intelligence_score}
              </p>
              <p className="text-slate-400 capitalize">Maturity: {result.maturity_band}</p>
            </div>

            <section className="bg-navy-light rounded-xl p-6 border border-slate-700 space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-lg"><BarChart3 size={20} className="text-accent" /> Top Revenue Opportunities</h3>
              <ul className="space-y-3">
                {result.top_opportunities.map((o, i) => (
                  <li key={i} className="border-l-2 border-accent pl-4">
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-slate-400">{o.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-navy-light rounded-xl p-6 border border-slate-700 space-y-3">
              <h3 className="font-semibold">Operational Bottlenecks</h3>
              {result.top_bottlenecks.map((b, i) => (
                <p key={i} className="text-sm text-slate-300">• {b.description}</p>
              ))}
            </section>

            {result.ai_automation_opportunities.length > 0 && (
              <section className="bg-navy-light rounded-xl p-6 border border-slate-700 space-y-3">
                <h3 className="flex items-center gap-2 font-semibold"><Zap size={18} className="text-cta" /> AI Automation Opportunities</h3>
                {result.ai_automation_opportunities.map((a, i) => (
                  <p key={i} className="text-sm text-slate-300">• {a.opportunity}</p>
                ))}
              </section>
            )}

            {result.data_reporting_gaps.length > 0 && (
              <section className="bg-navy-light rounded-xl p-6 border border-slate-700 space-y-3">
                <h3 className="flex items-center gap-2 font-semibold"><Database size={18} className="text-slate-400" /> Data & Reporting Gaps</h3>
                {result.data_reporting_gaps.map((g, i) => (
                  <p key={i} className="text-sm text-slate-300">• {g.gap}</p>
                ))}
              </section>
            )}

            <section className="bg-accent/10 border border-accent/30 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Recommended First Project</h3>
              <p className="text-lg">{result.recommended_first_project.name}</p>
            </section>

            <form onSubmit={handleBriefingSubmit} className="space-y-4 border-t border-slate-700 pt-8">
              <h3 className="text-xl font-bold">Get My Revenue Intelligence Briefing</h3>
              <p className="text-slate-400 text-sm">We'll send a personalized brief based on your diagnostic results.</p>
              <input required placeholder="Full name" value={briefing.name} onChange={(e) => setBriefing({ ...briefing, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
              <input required type="email" placeholder="Work email" value={briefing.email} onChange={(e) => setBriefing({ ...briefing, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
              <input required placeholder="Company" value={briefing.company} onChange={(e) => setBriefing({ ...briefing, company: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
              <input placeholder="Phone (optional)" value={briefing.phone} onChange={(e) => setBriefing({ ...briefing, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 focus:border-accent outline-none" />
              <button type="submit" className="w-full bg-cta hover:bg-cta-dark text-navy font-semibold py-3 rounded-lg transition">
                Request My Briefing
              </button>
            </form>
          </div>
        )}

        {step === 'briefing' && submitted && (
          <div className="animate-fade-in text-center space-y-6 py-12">
            <CheckCircle2 size={64} className="text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold">Briefing Request Received</h2>
            <p className="text-slate-300 max-w-md mx-auto">
              Thank you, {briefing.name}. We'll review your diagnostic results and send your
              personalized Revenue Intelligence Brief within 2 business days.
            </p>
            {result && (
              <p className="text-sm text-slate-500">Score: {result.revenue_intelligence_score}/100 · {briefing.company}</p>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-16 py-6 text-center text-xs text-slate-500">
        Freeman Intelligence · Revenue Systems Engineering · Metro Detroit
      </footer>
    </div>
  )
}
