import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DiagnosticPage from './pages/DiagnosticPage'
import LeakageCalculatorPage from './pages/LeakageCalculatorPage'
import AIMapperPage from './pages/AIMapperPage'
import HowItWorksPage from './pages/HowItWorksPage'
import ProductsPage from './pages/ProductsPage'
import ToolsPage from './pages/ToolsPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/leakage-calculator" element={<LeakageCalculatorPage />} />
          <Route path="/ai-mapper" element={<AIMapperPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
