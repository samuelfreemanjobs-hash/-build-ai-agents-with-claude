import { useState } from 'react'
import { FileText, Loader2, Download, AlertTriangle } from 'lucide-react'

const SAMPLE_RFP = `Company: GM Warren Stamping
Industry: Automotive

Services requested:
- Dedicated inbound shuttle
- Yard management
- ASN compliance desk

Volume: 1200 annual inbound moves
Geography: Detroit-Warren corridor
Certifications required: ISO 9001, CTPAT, SmartWay
Insurance: $2M general liability

Pain points:
- Unscheduled inbound trucks
- ASN mismatches at gate
- OTIF scorecard pressure`

export default function App() {
  const [rfpText, setRfpText] = useState(SAMPLE_RFP)
  const [tier, setTier] = useState('balanced')
  const [corridor, setCorridor] = useState('DET-WARREN')
  const [mockLlm, setMockLlm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [job, setJob] = useState(null)
  const [error, setError] = useState(null)

  async function generate() {
    setLoading(true)
    setError(null)
    setJob(null)
    try {
      const res = await fetch('/api/v1/proposals/generate-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfp_text: rfpText,
          pricing_tier: tier,
          corridor,
          mock_llm: mockLlm,
          company_id: 'default',
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail?.message || JSON.stringify(err.detail) || res.statusText)
      }
      setJob(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="banner">
        <strong>HUMAN REVIEW REQUIRED</strong> — Every number traces. Pricing from engine, not LLM.
      </div>

      <header>
        <div className="logo">
          <FileText color="#22d3ee" size={28} />
          <div>
            <div className="mono" style={{ letterSpacing: '0.15em', fontWeight: 500 }}>PROPOSALS AGENT™</div>
            <div className="tagline mono">Every number traces</div>
          </div>
        </div>
        <a href="/docs" target="_blank" rel="noreferrer" className="muted">API Docs</a>
      </header>

      <main>
        <div className="panel">
          <h2>New proposal</h2>
          <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)} placeholder="Paste RFP text…" />
          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <label className="muted">Pricing tier</label>
              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="competitive">Competitive</option>
                <option value="balanced">Balanced</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="muted">Corridor</label>
              <input value={corridor} onChange={(e) => setCorridor(e.target.value)} />
            </div>
          </div>
          <label className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={mockLlm} onChange={(e) => setMockLlm(e.target.checked)} />
            Mock LLM (no API key)
          </label>
          <button className="btn" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 size={16} style={{ verticalAlign: 'middle' }} /> Generating…</> : 'Generate proposal'}
          </button>
        </div>

        {error && (
          <div className="panel gap">
            <AlertTriangle size={18} style={{ verticalAlign: 'middle' }} /> {error}
          </div>
        )}

        {job && (
          <div className="panel">
            <h2>
              Result{' '}
              <span className={`status-badge status-${job.status}`}>{job.status}</span>
            </h2>
            {job.status === 'completed' && (
              <>
                <p><strong>{job.client_name}</strong></p>
                <p style={{ marginTop: 8 }}>
                  Total ({tier}): <span className="mono trace">${job.total_value}</span>
                </p>
                <p className="muted">Run: {job.run_id} · QA overall (min): {job.qa_overall}</p>
                {job.compliance_gaps > 0 && (
                  <p className="gap">Mandatory compliance gaps: {job.compliance_gaps}</p>
                )}
                {job.sections_preview?.executive_summary && (
                  <p className="muted" style={{ marginTop: 12 }}>{job.sections_preview.executive_summary}</p>
                )}
                {job.download_url && (
                  <a className="btn secondary" href={job.download_url} style={{ display: 'inline-flex', gap: 8, marginTop: 12, textDecoration: 'none' }}>
                    <Download size={16} /> Download JSON
                  </a>
                )}
              </>
            )}
            {job.status === 'halted' && (
              <p className="gap">Halt: {job.halt_cause} — {job.error_message}</p>
            )}
            {job.status === 'failed' && <p className="gap">{job.error_message}</p>}
            <pre style={{ marginTop: 16 }}>{JSON.stringify(job, null, 2)}</pre>
          </div>
        )}
      </main>
    </>
  )
}
