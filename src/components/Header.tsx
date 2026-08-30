import { Search, Sparkles } from 'lucide-react'

interface HeaderProps {
  totalPrompts: number
  categoryCount: number
}

export function Header({ totalPrompts, categoryCount }: HeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-white/5 bg-surface-950">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-amber-500/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 border border-accent/30">
            <Sparkles className="w-5 h-5 text-accent-light" />
          </div>
          <span className="text-sm font-medium text-accent-light tracking-wide uppercase">
            Prompt Library
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
          The Most Powerful
          <br />
          <span className="bg-gradient-to-r from-accent-light via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Open Prompt Library
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-8">
          Free, curated AI prompts for ChatGPT, Claude, Gemini, Midjourney and every major model.
          Browse by category, tool, or use case.
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-white font-semibold">{totalPrompts}+</span>
            <span className="text-slate-400">prompts</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-white font-semibold">{categoryCount}</span>
            <span className="text-slate-400">categories</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-white font-semibold">6</span>
            <span className="text-slate-400">AI models</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400 font-semibold">Free</span>
            <span className="text-slate-400">to browse & copy</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export function SearchBar({
  value,
  onChange,
  resultCount,
}: {
  value: string
  onChange: (value: string) => void
  resultCount: number
}) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
      <input
        type="search"
        placeholder="Search prompts by title, tag, or keyword..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
      />
      {value && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {resultCount} results
        </span>
      )}
    </div>
  )
}
