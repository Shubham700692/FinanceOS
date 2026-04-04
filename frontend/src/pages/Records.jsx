import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react'
import { recordsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Confirm } from '../components/ui'
import RecordModal from '../components/modals/RecordModal'
import { formatCurrency, formatDate, CATEGORIES, getErrorMessage } from '../utils'

export default function Records() {
  const { isAnalyst } = useAuth()
  const [records, setRecords]   = useState([])
  const [meta, setMeta]         = useState({})
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [filters, setFilters]   = useState({ page:1, limit:20, type:'', category:'', from:'', to:'', search:'', sortBy:'date', order:'desc' })
  const [modalOpen, setModalOpen]   = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]:v, page:1 }))

  const load = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''))
    recordsApi.list(params)
      .then(r => { setRecords(r.data.data); setMeta(r.data.meta||{}) })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try { await recordsApi.delete(deleteTarget.id); setSuccess('Record deleted'); setDeleteTarget(null); load() }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setDeleteLoading(false) }
  }

  const hasFilters = filters.type || filters.category || filters.from || filters.to || filters.search
  const inp = { border:'1px solid #e2e8f0', borderRadius:'0.75rem', padding:'0.5rem 0.75rem', fontSize:'0.875rem', color:'#334155', background:'#fff', outline:'none', width:'100%', fontFamily:'inherit' }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:600, color:'#0f172a', margin:0 }}>Financial Records</h1>
          <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.25rem' }}>{meta.total != null ? `${meta.total} records total` : 'All your transactions'}</p>
        </div>
        {isAnalyst && (
          <button onClick={() => { setEditRecord(null); setModalOpen(true) }}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'0.75rem', padding:'0.625rem 1.25rem', fontSize:'0.875rem', fontWeight:500, cursor:'pointer' }}>
            <Plus size={16} /> New Record
          </button>
        )}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', padding:'1rem', marginBottom:'1rem', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:'0.75rem' }}>
          <div style={{ position:'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)' }} />
            <input style={{ ...inp, paddingLeft:'2.25rem' }} placeholder="Search description or category…"
              value={filters.search} onChange={e => setFilter('search', e.target.value)} />
          </div>
          <select style={inp} value={filters.type} onChange={e => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select style={inp} value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <input type="date" style={inp} value={filters.from} onChange={e => setFilter('from', e.target.value)} />
          <input type="date" style={inp} value={filters.to}   onChange={e => setFilter('to',   e.target.value)} />
        </div>
        {hasFilters && (
          <button onClick={() => setFilters({ page:1, limit:20, type:'', category:'', from:'', to:'', search:'', sortBy:'date', order:'desc' })}
            style={{ marginTop:'0.75rem', display:'inline-flex', alignItems:'center', gap:'0.25rem', fontSize:'0.75rem', color:'#94a3b8', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Sort row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem', padding:'0 0.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Sort by:</span>
          {['date','amount','category'].map(s => (
            <button key={s} onClick={() => {
              if (filters.sortBy===s) setFilter('order', filters.order==='asc'?'desc':'asc')
              else setFilters(f=>({ ...f, sortBy:s, order:'desc', page:1 }))
            }} style={{ fontSize:'0.75rem', padding:'0.25rem 0.625rem', borderRadius:'0.5rem', border:'none', cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s',
              background: filters.sortBy===s ? '#eef2ff' : 'transparent',
              color: filters.sortBy===s ? '#4338ca' : '#64748b', fontWeight: filters.sortBy===s ? 600 : 400 }}>
              {s} {filters.sortBy===s ? (filters.order==='desc'?'↓':'↑') : ''}
            </button>
          ))}
        </div>
        <select style={{ ...inp, width:'auto' }} value={filters.limit} onChange={e => setFilters(f=>({...f,limit:e.target.value,page:1}))}>
          {[10,20,50].map(v => <option key={v} value={v}>{v} / page</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', overflow:'hidden', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        {loading ? <PageLoader /> : records.length === 0
          ? <div style={{ padding:'4rem', textAlign:'center', color:'#94a3b8' }}>No records found{hasFilters ? ' — try adjusting your filters' : ''}</div>
          : <>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                    {['Date','Type','Category','Description','Tags','Amount',...(isAnalyst?['Actions']:[''])].map(h => (
                      <th key={h} style={{ padding:'0.875rem 1.25rem', textAlign: h==='Amount'||h==='Actions' ? 'right' : 'left', fontSize:'0.7rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec.id} style={{ borderBottom:'1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.75rem', color:'#64748b', whiteSpace:'nowrap' }}>{formatDate(rec.date)}</td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.6rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:600,
                          background: rec.type==='income'?'#f0fdf4':'#fff1f2', color: rec.type==='income'?'#166534':'#9f1239' }}>
                          {rec.type==='income' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{rec.type}
                        </span>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem', color:'#475569', textTransform:'capitalize' }}>{rec.category}</td>
                      <td style={{ padding:'0.875rem 1.25rem', color:'#64748b', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rec.description||'—'}</td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <div style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap' }}>
                          {rec.tags?.slice(0,2).map(t => (
                            <span key={t} style={{ background:'#f1f5f9', color:'#475569', fontSize:'0.65rem', padding:'0.15rem 0.5rem', borderRadius:'9999px' }}>{t}</span>
                          ))}
                          {rec.tags?.length > 2 && <span style={{ background:'#f1f5f9', color:'#94a3b8', fontSize:'0.65rem', padding:'0.15rem 0.5rem', borderRadius:'9999px' }}>+{rec.tags.length-2}</span>}
                        </div>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem', textAlign:'right', fontWeight:600, fontFamily:'monospace', whiteSpace:'nowrap', color: rec.type==='income'?'#059669':'#e11d48' }}>
                        {rec.type==='income'?'+':'−'}{formatCurrency(rec.amount)}
                      </td>
                      {isAnalyst && (
                        <td style={{ padding:'0.875rem 1.25rem', textAlign:'right' }}>
                          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.25rem' }}>
                            <button style={{ padding:'0.375rem', border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8', borderRadius:'0.5rem', display:'flex' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#eef2ff'; e.currentTarget.style.color='#4f46e5' }}
                              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8' }}
                              onClick={() => { setEditRecord(rec); setModalOpen(true) }}><Edit2 size={14} /></button>
                            <button style={{ padding:'0.375rem', border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8', borderRadius:'0.5rem', display:'flex' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.color='#e11d48' }}
                              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8' }}
                              onClick={() => setDeleteTarget(rec)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {meta.totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 1.25rem', borderTop:'1px solid #f1f5f9' }}>
                  <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Page {filters.page} of {meta.totalPages}</span>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button className="btn-secondary btn-sm" disabled={filters.page<=1} onClick={() => setFilters(f=>({...f,page:f.page-1}))}>Prev</button>
                    <button className="btn-secondary btn-sm" disabled={filters.page>=meta.totalPages} onClick={() => setFilters(f=>({...f,page:f.page+1}))}>Next</button>
                  </div>
                </div>
              )}
            </>
        }
      </div>

      <RecordModal open={modalOpen} onClose={() => { setModalOpen(false); setEditRecord(null) }}
        onSaved={() => { load(); setSuccess(editRecord ? 'Record updated!' : 'Record created!') }} record={editRecord} />
      <Confirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleteLoading} title="Delete Record"
        message={`Delete this ${deleteTarget?.type} of ${formatCurrency(deleteTarget?.amount)}? This cannot be undone.`} />
    </div>
  )
}