import { Search } from 'lucide-react'

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-900 border border-white/5 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No prompts found</h3>
      <p className="text-slate-400 max-w-md">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'The prompt library is empty. Check back soon for new prompts.'}
      </p>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <span className="text-sm font-bold text-accent-light">P</span>
            </div>
            <span className="text-sm text-slate-400">
              Prompt Library — Curated AI prompts for every workflow
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Free to browse and copy. Built for ChatGPT, Claude, Gemini, Midjourney & more.
          </p>
        </div>
      </div>
    </footer>
  )
}
