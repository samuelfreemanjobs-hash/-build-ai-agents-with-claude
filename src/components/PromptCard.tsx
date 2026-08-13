import { Copy, Check, Heart, Eye } from 'lucide-react'
import type { Prompt } from '../types/prompt'

interface PromptCardProps {
  prompt: Prompt
  onClick: () => void
  onCopy: () => void
  isCopied: boolean
}

export function PromptCard({ prompt, onClick, onCopy, isCopied }: PromptCardProps) {
  const preview = prompt.content.slice(0, 200).replace(/^#+\s/gm, '')

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-white/5 bg-surface-900/50 hover:bg-surface-900 hover:border-white/10 transition-all duration-300 overflow-hidden animate-slide-up"
    >
      <button onClick={onClick} className="flex-1 p-5 text-left">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{prompt.emoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white group-hover:text-accent-light transition-colors line-clamp-2">
              {prompt.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{prompt.description}</p>

        <div className="relative rounded-lg bg-surface-950 border border-white/5 p-3 mb-4">
          <pre className="text-xs text-slate-500 font-mono line-clamp-3 whitespace-pre-wrap">
            {preview}...
          </pre>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 to-transparent rounded-lg" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.models.slice(0, 3).map((model) => (
            <span
              key={model}
              className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-slate-400 border border-white/5"
            >
              {model}
            </span>
          ))}
          {prompt.models.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-slate-500">
              +{prompt.models.length - 3}
            </span>
          )}
        </div>
      </button>

      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-surface-950/50">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {prompt.likes}
          </span>
          <span className="flex items-center gap-1">
            <Copy className="w-3.5 h-3.5" />
            {prompt.copies}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopy()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
              isCopied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-accent/20 text-accent-light border border-accent/30 hover:bg-accent/30'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
