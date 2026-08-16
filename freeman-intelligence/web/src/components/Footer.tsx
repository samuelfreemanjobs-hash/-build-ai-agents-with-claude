import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-16 py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="font-semibold mb-2">Freeman Intelligence</p>
          <p className="text-slate-400">Revenue Systems Engineering for Metro Detroit automotive, logistics, and industrial companies.</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Tools</p>
          <ul className="space-y-1 text-slate-400">
            <li><Link to="/diagnostic" className="hover:text-white transition">Revenue Opportunity Diagnostic</Link></li>
            <li><Link to="/leakage-calculator" className="hover:text-white transition">Revenue Leakage Calculator</Link></li>
            <li><Link to="/ai-mapper" className="hover:text-white transition">AI Opportunity Mapper</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Products</p>
          <ul className="space-y-1 text-slate-400">
            <li><Link to="/products" className="hover:text-white transition">Revenue Intelligence Audit</Link></li>
            <li><Link to="/products" className="hover:text-white transition">Website Revenue Audit (WRIS)</Link></li>
            <li><Link to="/products" className="hover:text-white transition">Revenue Systems Engineering</Link></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 mt-8">© {new Date().getFullYear()} Freeman Intelligence · Metro Detroit</p>
    </footer>
  )
}
