import { useEffect, useState, useCallback } from 'react'
import { Shield } from 'lucide-react'
import { auditApi } from '../api'
import { PageLoader, Alert } from '../components/ui'
import { getErrorMessage } from '../utils'

const ACTION_COLOR = {
  REGISTER:      { bg:'#f0fdf4', color:'#166534' },
  LOGIN:         { bg:'#f1f5f9', color:'#475569' },
  CREATE_RECORD: { bg:'#f0fdf4', color:'#166534' },
  UPDATE_RECORD: { bg:'#eff6ff', color:'#1e40af' },
  DELETE_RECORD: { bg:'#fff1f2', color:'#9f1239' },
  UPDATE_USER:   { bg:'#eff6ff', color:'#1e40af' },
  DELETE_USER:   { bg:'#fff1f2', color:'#9f1239' },
  UPSERT_BUDGET: { bg:'#e0e7ff', color:'#3730a3' },
  DELETE_BUDGET: { bg:'#fff1f2', color:'#9f1239' },
}

export default function AuditLog() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [page, setPage]       = useState(1)
  const [action, setAction]   = useState('')
  const limit = 20

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit }
    if (action) params.action = action
    auditApi.list(params)
      .then(r => setLogs(r.data.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, action])

  useEffect(() => { load() }, [load])

  const ACTIONS = ['LOGIN','REGISTER','CREATE_RECORD','UPDATE_RECORD','DELETE_RECORD','UPDATE_USER','DELETE_USER','UPSERT_BUDGET','DELETE_BUDGET']

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:600, color:'#0f172a', margin:0 }}>Audit Log</h1>
          <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.25rem' }}>Complete trail of all system actions</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'0.75rem', padding:'0.5rem 0.875rem' }}>
          <Shield size={14} color="#d97706" />
          <span style={{ fontSize:'0.75rem', color:'#78350f', fontWeight:500 }}>Admin only</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', padding:'1rem', marginBottom:'1rem', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        <select value={action} onChange={e => { setAction(e.target.value); setPage(1) }}
          style={{ border:'1px solid #e2e8f0', borderRadius:'0.75rem', padding:'0.5rem 0.75rem', fontSize:'0.875rem', color:'#334155', background:'#fff', minWidth:'200px' }}>
          <option value="">All actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', overflow:'hidden', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        {loading ? <PageLoader /> : logs.length === 0
          ? <div style={{ padding:'4rem', textAlign:'center' }}>
              <Shield size={40} color="#e2e8f0" style={{ margin:'0 auto 1rem', display:'block' }} />
              <p style={{ color:'#94a3b8', fontSize:'0.875rem', margin:0 }}>No audit logs</p>
              <p style={{ color:'#cbd5e1', fontSize:'0.75rem', marginTop:'0.25rem' }}>Actions will appear here as users interact with the system</p>
            </div>
          : <>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                    {['Timestamp','User','Action','Resource','Resource ID','IP'].map(h => (
                      <th key={h} style={{ padding:'0.875rem 1.25rem', textAlign:'left', fontSize:'0.7rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const ac = ACTION_COLOR[log.action] || { bg:'#f1f5f9', color:'#475569' }
                    return (
                      <tr key={log.id} style={{ borderBottom:'1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.7rem', color:'#64748b', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding:'0.875rem 1.25rem' }}>
                          <p style={{ fontSize:'0.8rem', fontWeight:500, color:'#1e293b', margin:0 }}>{log.user_name || '—'}</p>
                          <p style={{ fontSize:'0.7rem', color:'#94a3b8', margin:0 }}>{log.user_email}</p>
                        </td>
                        <td style={{ padding:'0.875rem 1.25rem' }}>
                          <span style={{ background:ac.bg, color:ac.color, fontSize:'0.65rem', fontWeight:600, padding:'0.2rem 0.5rem', borderRadius:'9999px', whiteSpace:'nowrap' }}>
                            {log.action.replace(/_/g,' ')}
                          </span>
                        </td>
                        <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.75rem', color:'#64748b', textTransform:'capitalize' }}>
                          {log.resource_type?.replace(/_/g,' ')}
                        </td>
                        <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.7rem', color:'#94a3b8', fontFamily:'monospace' }}>
                          {log.resource_id ? log.resource_id.slice(0,8)+'…' : '—'}
                        </td>
                        <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.7rem', color:'#94a3b8', fontFamily:'monospace' }}>
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 1.25rem', borderTop:'1px solid #f1f5f9' }}>
                <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Page {page}</span>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button className="btn-secondary btn-sm" disabled={page<=1} onClick={() => setPage(p=>p-1)}>Prev</button>
                  <button className="btn-secondary btn-sm" disabled={logs.length<limit} onClick={() => setPage(p=>p+1)}>Next</button>
                </div>
              </div>
            </>
        }
      </div>
    </div>
  )
}