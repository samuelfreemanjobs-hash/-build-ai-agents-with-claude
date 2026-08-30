import { useEffect, useState } from 'react'
import { X, Copy, Check, Heart, Tag, Layers, FileText, Shuffle } from 'lucide-react'
import { getCategoryById } from '../data/categories'
import type { Prompt, PromptSwipe } from '../types/prompt'

type Tab = 'original' | 'fill-in-blank' | 'swipes'

interface PromptModalProps {
  prompt: Prompt | null
  onClose: () => void
  onCopy: (text: string) => void
  copiedText: string | null
}

export function PromptModal({ prompt, onClose, onCopy, copiedText }: PromptModalProps) {
  const [tab, setTab] = useState<Tab>('original')
  const [activeSwipe, setActiveSwipe] = useState(0)

  useEffect(() => {
    if (!prompt) return
    setTab('original')
    setActiveSwipe(0)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [prompt, onClose])

  if (!prompt) return null

  const swipes = prompt.swipes ?? []
  const hasFillInBlank = Boolean(prompt.fillInBlank)
  const hasSwipes = swipes.length > 0

  const activeContent = (): string => {
    if (tab === 'fill-in-blank' && prompt.fillInBlank) return prompt.fillInBlank
    if (tab === 'swipes' && swipes[activeSwipe]) return swipes[activeSwipe].content
    return prompt.content
  }

  const content = activeContent()
  const isCopied = copiedText === content

  const tabs: { id: Tab; label: string; icon: typeof FileText; show: boolean }[] = [
    { id: 'original', label: 'Original', icon: FileText, show: true },
    { id: 'fill-in-blank', label: 'Fill-in-Blank', icon: Layers, show: hasFillInBlank },
    { id: 'swipes', label: `Swipes (${swipes.length})`, icon: Shuffle, show: hasSwipes },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-surface-900 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/5 bg-surface-900/95 backdrop-blur-sm">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-3xl">{prompt.emoji}</span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white mb-1">{prompt.title}</h2>
              <p className="text-sm text-slate-400">{prompt.description}</p>
              {prompt.collection && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  1000+ Collection
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-220px)] sm:max-h-[calc(90vh-220px)]">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {prompt.models.map((model) => (
                <span key={model} className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent-light border border-accent/20">
                  {model}
                </span>
              ))}
              {prompt.categories.map((catId) => {
                const cat = getCategoryById(catId)
                return cat ? (
                  <span key={catId} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white/5 text-slate-400">
                    {cat.icon} {cat.name}
                  </span>
                ) : null
              })}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-surface-950 border border-white/5">
              {tabs.filter((t) => t.show).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                    tab === id
                      ? 'bg-accent/20 text-accent-light border border-accent/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Swipe selector */}
            {tab === 'swipes' && swipes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Choose a swipe variation</p>
                <div className="grid gap-2">
                  {swipes.map((swipe: PromptSwipe, i: number) => (
                    <button
                      key={swipe.id}
                      onClick={() => setActiveSwipe(i)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        activeSwipe === i
                          ? 'bg-accent/10 border-accent/30 text-white'
                          : 'bg-surface-950 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="text-sm font-medium">{swipe.title}</div>
                      <div className="text-xs mt-0.5 opacity-70">{swipe.useCase}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'fill-in-blank' && (
              <p className="text-xs text-slate-500 bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                Fill in the <code className="text-blue-400">{`{{placeholders}}`}</code> with your specifics before copying. Each blank is a variable you customize.
              </p>
            )}

            <div className="relative rounded-xl bg-surface-950 border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-900/50">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {tab === 'original' ? 'Prompt' : tab === 'fill-in-blank' ? 'Fill-in-Blank Template' : 'Swipe Variation'}
                </span>
                <button
                  onClick={() => onCopy(content)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                    isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-accent/20 text-accent-light hover:bg-accent/30'
                  }`}
                >
                  {isCopied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                </button>
              </div>
              <pre className="p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                {content}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{prompt.likes} likes</span>
              <span className="flex items-center gap-1.5"><Copy className="w-4 h-4" />{prompt.copies} copies</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-4 h-4" />
                {prompt.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="text-xs text-slate-600">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-4 sm:p-5 border-t border-white/5 bg-surface-900/95 backdrop-blur-sm">
          <button
            onClick={() => onCopy(content)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              isCopied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-accent text-white hover:bg-accent-dark shadow-lg shadow-accent/25'
            }`}
          >
            {isCopied ? <><Check className="w-5 h-5" />Copied to clipboard!</> : <><Copy className="w-5 h-5" />Copy to clipboard</>}
          </button>
        </div>
      </div>
    </div>
  )
}
