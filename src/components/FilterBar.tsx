import { X } from 'lucide-react'
import { categories } from '../data/categories'
import { aiModels } from '../data/prompts'
import type { AIModel, FilterState, PromptType, SortOption } from '../types/prompt'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (updates: Partial<FilterState>) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'shuffled', label: 'Shuffled' },
  { value: 'popular', label: 'Most Copied' },
  { value: 'recent', label: 'Most Liked' },
  { value: 'title', label: 'Title A-Z' },
]

const typeOptions: { value: PromptType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
]

export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Category"
          value={filters.category ?? ''}
          onChange={(v) => onFilterChange({ category: v || null })}
          options={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
        />

        <FilterSelect
          label="Model"
          value={filters.model ?? ''}
          onChange={(v) => onFilterChange({ model: (v as AIModel) || null })}
          options={aiModels.map((m) => ({ value: m, label: m }))}
        />

        <FilterSelect
          label="Type"
          value={filters.type ?? ''}
          onChange={(v) => onFilterChange({ type: (v as PromptType) || null })}
          options={typeOptions}
        />

        <FilterSelect
          label="Collection"
          value={filters.collection ?? ''}
          onChange={(v) => onFilterChange({ collection: v || null })}
          options={[
            { value: '1000-prompts', label: '📚 1000+ Prompts' },
            { value: '150-chatgpt-prompts', label: '⚡ 150 Best ChatGPT' },
            { value: 'bonus3-marketing', label: '🎯 BONUS 3 Marketing' },
            { value: 'wharton-gail', label: '🎓 Wharton GAIL' },
          ]}
        />

        <FilterSelect
          label="Sort by"
          value={filters.sort}
          onChange={(v) => onFilterChange({ sort: v as SortOption })}
          options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
        />

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 ${
          value
            ? 'bg-accent/20 border-accent/40 text-accent-light'
            : 'bg-surface-900 border-white/10 text-slate-300 hover:border-white/20'
        }`}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-900">
            {o.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export function CategoryGrid({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string | null
  onSelectCategory: (id: string | null) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}
          className={`group flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
            selectedCategory === cat.id
              ? 'bg-accent/20 border-accent/40 text-white'
              : 'bg-surface-900/50 border-white/5 text-slate-300 hover:bg-surface-900 hover:border-white/10'
          }`}
        >
          <span className="text-xl">{cat.icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{cat.name}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
