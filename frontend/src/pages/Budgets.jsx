import { useEffect, useState } from 'react'
import { Plus, Trash2, Target, TrendingDown } from 'lucide-react'
import { budgetsApi, dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Confirm, Modal, Spinner } from '../components/ui'
import { formatCurrency, CATEGORIES, getErrorMessage } from '../utils'

export default function Budgets() {
  const { isAdmin } = useAuth()
  const [analysis, setAnalysis]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [form, setForm] = useState({ category:'', monthly_limit:'' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([dashboardApi.budgetAnalysis(), budgetsApi.list()])
      .then(([a]) => setAnalysis(a.data.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await budgetsApi.upsert({ category: form.category, monthly_limit: parseFloat(form.monthly_limit) })
      setSuccess('Budget saved!'); setModalOpen(false); setForm({ category:'', monthly_limit:'' }); load()
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await budgetsApi.delete(deleteTarget.category)
      setSuccess('Budget removed'); setDeleteTarget(null); load()
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setDeleteLoading(false) }
  }

  const statusColor = (s) => s==='over_budget' ? '#e11d48' : s==='warning' ? '#d97706' : '#059669'
  const statusBg    = (s) => s==='over_budget' ? '#fff1f2' : s==='warning' ? '#fffbeb' : '#f0fdf4'
  const statusLabel = (s) => s==='over_budget' ? 'Over Budget' : s==='warning' ? 'Warning' : s==='on_track' ? 'On Track' : 'No Budget'

  if (loading) return <PageLoader />

  const overBudget = analysis.filter(a => a.status==='over_budget').length
  const onTrack    = analysis.filter(a => a.status==='on_track').length

  return (
    <div>
   
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:600, color:'#0f172a', margin:0 }}>Budgets</h1>
          <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.25rem' }}>Monthly spending limits by category</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'0.75rem', padding:'0.625rem 1.25rem', fontSize:'0.875rem', fontWeight:500, cursor:'pointer' }}>
            <Plus size={16} /> Set Budget
          </button>
        )}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

     
      {analysis.length > 0 && (
        <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {[
            { icon: <Target size={16} color="#4f46e5" />, bg:'#eef2ff', label:'Active Budgets', value: analysis.filter(a=>a.budget).length },
            { icon: <span style={{ width:8, height:8, borderRadius:'50%', background: overBudget>0?'#e11d48':'#059669', display:'inline-block' }} />, bg:'#fff', label:'Over Budget', value:`${overBudget} categories` },
            { icon: <span style={{ width:8, height:8, borderRadius:'50%', background:'#059669', display:'inline-block' }} />, bg:'#fff', label:'On Track', value:`${onTrack} categories` },
          ].map((s,i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', padding:'0.875rem 1.25rem', display:'flex', alignItems:'center', gap:'0.75rem', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
              <div style={{ padding:'0.5rem', background:s.bg, borderRadius:'0.5rem', display:'flex' }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:'0.7rem', color:'#94a3b8', margin:0 }}>{s.label}</p>
                <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#0f172a', margin:0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {analysis.length === 0
        ? <div style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #e2e8f0', padding:'4rem', textAlign:'center' }}>
            <Target size={40} color="#e2e8f0" style={{ margin:'0 auto 1rem' }} />
            <p style={{ color:'#94a3b8', fontSize:'0.875rem' }}>No budget data. Set category budgets to track spending.</p>
          </div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
            {analysis.map(b => {
              const color = statusColor(b.status)
              const pct   = Math.min(b.utilization_percent ?? 0, 100)
              return (
                <div key={b.category} style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #e2e8f0', padding:'1.25rem', boxShadow:'0 1px 3px rgb(0 0 0/.06)', transition:'box-shadow 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <div>
                      <p style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e293b', textTransform:'capitalize', margin:0 }}>{b.category}</p>
                      {b.budget && <p style={{ fontSize:'0.7rem', color:'#94a3b8', margin:'0.25rem 0 0' }}>Limit: {formatCurrency(b.budget)} / month</p>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <span style={{ background: statusBg(b.status), color, fontSize:'0.7rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'9999px' }}>
                        {statusLabel(b.status)}
                      </span>
                      {isAdmin && b.budget && (
                        <button onClick={() => setDeleteTarget(b)}
                          style={{ padding:'0.25rem', border:'none', background:'transparent', cursor:'pointer', color:'#cbd5e1', borderRadius:'0.375rem', display:'flex' }}
                          onMouseEnter={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.color='#e11d48' }}
                          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#cbd5e1' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {b.budget && (
                    <div style={{ marginBottom:'0.75rem' }}>
                      <div style={{ height:6, background:'#f1f5f9', borderRadius:9999, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:9999, transition:'width 0.5s' }} />
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.375rem' }}>
                        <span style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{b.utilization_percent}% used</span>
                        <span style={{ fontSize:'0.7rem', fontWeight:500, color: b.remaining < 0 ? '#e11d48' : '#059669' }}>
                          {b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(Math.abs(b.remaining))} over`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <TrendingDown size={14} color="#e11d48" />
                    <span style={{ fontSize:'0.75rem', color:'#64748b' }}>Spent this month:</span>
                    <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#1e293b', fontFamily:'monospace' }}>{formatCurrency(b.spent)}</span>
                  </div>
                </div>
              )
            })}
          </div>
      }

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set Monthly Budget" size="sm">
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label className="label">Category</label>
            <select className="input" required value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit (₹)</label>
            <input type="number" className="input" required min="1" step="1" placeholder="e.g. 15000"
              value={form.monthly_limit} onChange={e => setForm(f => ({ ...f, monthly_limit:e.target.value }))} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem', paddingTop:'0.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save Budget'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleteLoading} title="Remove Budget"
        message={`Remove the budget for "${deleteTarget?.category}"?`} />
    </div>
  )
}