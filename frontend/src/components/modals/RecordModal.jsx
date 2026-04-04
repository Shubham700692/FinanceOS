import { useState, useEffect } from 'react'
import { recordsApi } from '../../api'
import { Modal, Alert, Spinner } from '../ui'
import { CATEGORIES, getErrorMessage } from '../../utils'

const today = () => new Date().toISOString().split('T')[0]
const empty = { amount:'', type:'expense', category:'', date:today(), description:'', tags:'' }

export default function RecordModal({ open, onClose, onSaved, record }) {
  const [form, setForm]     = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const isEdit = !!record

  useEffect(() => {
    if (record) {
      setForm({ amount:record.amount??'', type:record.type??'expense', category:record.category??'', date:record.date??today(), description:record.description??'', tags:Array.isArray(record.tags)?record.tags.join(', '):'' })
    } else { setForm(empty) }
    setError('')
  }, [record, open])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const payload = { amount:parseFloat(form.amount), type:form.type, category:form.category, date:form.date, description:form.description||undefined, tags:form.tags?form.tags.split(',').map(t=>t.trim()).filter(Boolean):[] }
      if (isEdit) await recordsApi.update(record.id, payload)
      else await recordsApi.create(payload)
      onSaved(); onClose()
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit?'Edit Record':'New Record'}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'0.75rem' }}>
        {/* Type toggle */}
        <div>
          <label style={{ display:'block', fontSize:'0.75rem', fontWeight:500, color:'#475569', marginBottom:'0.5rem' }}>Type</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
            {['income','expense'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f=>({...f,type:t}))}
                style={{ padding:'0.625rem', borderRadius:'0.75rem', fontSize:'0.875rem', fontWeight:500, cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s',
                  border: form.type===t ? `2px solid ${t==='income'?'#059669':'#e11d48'}` : '2px solid #e2e8f0',
                  background: form.type===t ? (t==='income'?'#f0fdf4':'#fff1f2') : '#f8fafc',
                  color: form.type===t ? (t==='income'?'#166534':'#9f1239') : '#64748b' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" className="input" required min="0.01" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" required value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" required value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Description <span style={{ color:'#cbd5e1' }}>(optional)</span></label>
          <input type="text" className="input" placeholder="e.g. Monthly rent payment"
            value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
        </div>
        <div>
          <label className="label">Tags <span style={{ color:'#cbd5e1' }}>(comma separated)</span></label>
          <input type="text" className="input" placeholder="e.g. recurring, work"
            value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} />
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem', paddingTop:'0.25rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : isEdit ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </form>
    </Modal>
  )
}