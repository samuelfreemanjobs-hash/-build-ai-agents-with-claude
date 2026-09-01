import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgePercent,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import {
  CATEGORIES,
  PRODUCTS,
  SORT_OPTIONS,
  formatPrice,
  savings,
} from './data/products'

function ProductModal({ product, onClose }) {
  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-64 w-full object-cover sm:h-80"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1616594039964-ae9022a766b0?w=800&q=80'
            }}
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">{product.brand}</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-charcoal sm:text-3xl">
            {product.name}
          </h2>
          <p className="mt-3 text-stone-600">{product.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 text-sm">
            <div>
              <p className="text-stone-500">Material</p>
              <p className="font-medium">{product.material}</p>
            </div>
            <div>
              <p className="text-stone-500">Dimensions</p>
              <p className="font-medium">{product.dimensions}</p>
            </div>
            <div>
              <p className="text-stone-500">Type</p>
              <p className="font-medium">{product.type}</p>
            </div>
            <div>
              <p className="text-stone-500">Availability</p>
              <p className="font-medium text-green-700">{product.inStock ? 'In Stock' : 'Limited'}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-sm text-stone-500 line-through">{formatPrice(product.retailPrice)}</p>
              <p className="font-serif text-3xl font-bold text-charcoal">{formatPrice(product.salePrice)}</p>
            </div>
            <div className="rounded-lg bg-red-50 px-3 py-2">
              <p className="text-xs font-medium text-red-600">You save</p>
              <p className="text-lg font-bold text-red-700">{formatPrice(savings(product))}</p>
            </div>
            <div className="rounded-lg bg-gold/10 px-3 py-2">
              <p className="text-xs font-medium text-gold-dark">{product.discount}% OFF</p>
            </div>
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-4 font-semibold text-white transition hover:bg-charcoal-light"
          >
            Shop at {product.brand}
            <ExternalLink className="h-5 w-5" />
          </a>
          <p className="mt-3 text-center text-xs text-stone-400">
            Affiliate link — opens retailer site in new tab
          </p>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onSelect }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1616594039964-ae9022a766b0?w=600&q=80'
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {product.discount}% off
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase text-charcoal">
          {product.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 font-serif text-lg font-semibold leading-snug text-charcoal">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-stone-500">{product.type}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-bold">{formatPrice(product.salePrice)}</span>
            <span className="text-sm text-stone-400 line-through">{formatPrice(product.retailPrice)}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-green-700">
            Save {formatPrice(savings(product))}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onSelect(product)}
              className="flex-1 rounded-lg border border-stone-300 py-2 text-sm font-medium transition hover:border-charcoal hover:bg-stone-50"
            >
              Details
            </button>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-charcoal py-2 text-sm font-medium text-white transition hover:bg-charcoal-light"
            >
              Shop
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('discount')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [minDiscount, setMinDiscount] = useState(0)

  const filtered = useMemo(() => {
    let items = [...PRODUCTS]

    if (category !== 'all') {
      items = items.filter((p) => p.category === category)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q),
      )
    }

    if (minDiscount > 0) {
      items = items.filter((p) => p.discount >= minDiscount)
    }

    switch (sort) {
      case 'price-low':
        items.sort((a, b) => a.salePrice - b.salePrice)
        break
      case 'price-high':
        items.sort((a, b) => b.salePrice - a.salePrice)
        break
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        items.sort((a, b) => b.discount - a.discount)
    }

    return items
  }, [category, sort, search, minDiscount])

  const stats = useMemo(() => {
    const totalSavings = PRODUCTS.reduce((sum, p) => sum + savings(p), 0)
    const avgDiscount = Math.round(
      PRODUCTS.reduce((sum, p) => sum + p.discount, 0) / PRODUCTS.length,
    )
    return { totalSavings, avgDiscount, count: PRODUCTS.length }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b border-stone-200 bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center gap-2 text-gold">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-widest">Curated Clearance</span>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">
            Luxury Bedroom Outlet
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-300">
            Underpriced luxury bedroom furniture from Macy&apos;s clearance and Great Home Values.
            Real products, real links — up to {Math.max(...PRODUCTS.map((p) => p.discount))}% off retail.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 sm:max-w-lg">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">{stats.count}</p>
              <p className="text-xs text-stone-400">Live deals</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">{stats.avgDiscount}%</p>
              <p className="text-xs text-stone-400">Avg. discount</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">{formatPrice(stats.totalSavings)}</p>
              <p className="text-xs text-stone-400">Total savings</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                placeholder="Search beds, sets, dressers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === cat.id
                      ? 'bg-charcoal text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-stone-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value={0}>Any discount</option>
                <option value={30}>30%+ off</option>
                <option value={40}>40%+ off</option>
                <option value={50}>50%+ off</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Showing <span className="font-semibold text-charcoal">{filtered.length}</span> of{' '}
            {PRODUCTS.length} deals
          </p>
          <a
            href="https://www.macys.com/shop/sale/clearance-closeout/home/furniture?id=341192"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-gold-dark hover:underline"
          >
            <Tag className="h-4 w-4" />
            Browse Macy&apos;s clearance
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center">
            <BadgePercent className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-4 font-serif text-xl text-stone-500">No deals match your filters</p>
            <button
              onClick={() => {
                setCategory('all')
                setSearch('')
                setMinDiscount(0)
              }}
              className="mt-4 text-sm font-medium text-gold-dark hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={setSelected} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-stone-100 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm text-stone-500">
            Luxury Bedroom Outlet aggregates real clearance deals from Macy&apos;s.
            Prices and availability change — always verify on the retailer site.
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Affiliate disclosure: Links may earn a commission at no extra cost to you.
          </p>
        </div>
      </footer>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
