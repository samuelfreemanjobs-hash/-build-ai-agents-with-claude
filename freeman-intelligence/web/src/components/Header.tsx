import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/products', label: 'Products' },
    { to: '/tools', label: 'Tools' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b border-slate-700/50 px-6 py-4 sticky top-0 bg-navy/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="group">
          <p className="text-xs uppercase tracking-widest text-slate-400 group-hover:text-accent transition">Freeman Intelligence</p>
          <p className="text-sm font-semibold">Revenue Systems Engineering</p>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`text-sm transition ${isActive(l.to) ? 'text-accent' : 'text-slate-300 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
          <Link to="/diagnostic" className="bg-cta hover:bg-cta-dark text-navy text-sm font-semibold px-4 py-2 rounded-lg transition">
            Start Diagnostic
          </Link>
        </nav>

        <button className="md:hidden text-slate-300" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden mt-4 pb-4 space-y-3 border-t border-slate-700 pt-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white py-1">
              {l.label}
            </Link>
          ))}
          <Link to="/diagnostic" onClick={() => setOpen(false)} className="block bg-cta text-navy font-semibold px-4 py-2 rounded-lg text-center">
            Start Diagnostic
          </Link>
        </nav>
      )}
    </header>
  )
}
