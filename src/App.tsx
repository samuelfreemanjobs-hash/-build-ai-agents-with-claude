import { useState } from 'react'
import { Header, SearchBar } from './components/Header'
import { FilterBar, CategoryGrid } from './components/FilterBar'
import { PromptCard } from './components/PromptCard'
import { PromptModal } from './components/PromptModal'
import { EmptyState, Footer } from './components/EmptyState'
import { categories } from './data/categories'
import { defaultFilters, useCopyPrompt, usePrompts } from './hooks/usePrompts'
import type { FilterState, Prompt } from './types/prompt'

export default function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [showCategories, setShowCategories] = useState(false)

  const { prompts: filteredPrompts, totalCount } = usePrompts(filters)
  const { copiedId, copiedText, copyPrompt, copyText } = useCopyPrompt()

  const hasActiveFilters =
    filters.search || filters.category || filters.model || filters.type || filters.collection

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const handleCopy = (prompt: Prompt) => {
    copyPrompt(prompt)
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <Header totalPrompts={totalCount} categoryCount={categories.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 mb-8">
          <SearchBar
            value={filters.search}
            onChange={(search) => updateFilters({ search })}
            resultCount={filteredPrompts.length}
          />

          <FilterBar
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            hasActiveFilters={!!hasActiveFilters}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {showCategories ? 'Hide categories' : 'Browse by category'}
            </button>
            <span className="text-sm text-slate-500">
              Showing {filteredPrompts.length} of {totalCount} prompts
            </span>
          </div>

          {showCategories && (
            <CategoryGrid
              selectedCategory={filters.category}
              onSelectCategory={(id) => updateFilters({ category: id })}
            />
          )}
        </div>

        {filteredPrompts.length === 0 ? (
          <EmptyState hasFilters={!!hasActiveFilters} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onClick={() => setSelectedPrompt(prompt)}
                onCopy={() => handleCopy(prompt)}
                isCopied={copiedId === prompt.id}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <PromptModal
        prompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onCopy={(text) => copyText(text, selectedPrompt?.id)}
        copiedText={copiedText}
      />
    </div>
  )
}
