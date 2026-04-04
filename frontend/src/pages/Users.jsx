import { useEffect, useState, useCallback } from 'react'
import { Edit2, UserX, Search, Shield } from 'lucide-react'
import { usersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Confirm, Modal, Spinner } from '../components/ui'
import { formatDate, getErrorMessage } from '../utils'

const roleBadge = { admin:{ bg:'#e0e7ff', color:'#3730a3' }, analyst:{ bg:'#dbeafe', color:'#1e40af' }, viewer:{ bg:'#f1f5f9', color:'#475569' } }
const statusBadge = { active:{ bg:'#f0fdf4', color:'#166534' }, inactive:{ bg:'#f1f5f9', color:'#64748b' } }

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers]   = useState([])
  const [stats, setStats]   = useState(null)
  const [meta, setMeta]     = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editForm, setEditForm] = useState({ name:'', role:'', status:'' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit:15 }
    if (search) params.search = search
    if (roleFilter) params.role = roleFilter
    if (statusFilter) params.status = statusFilter
    Promise.all([usersApi.list(params), usersApi.stats()])
      .then(([u, s]) => { setUsers(u.data.data); setMeta(u.data.meta||{}); setStats(s.data.data) })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await usersApi.update(editTarget.id, editForm); setSuccess('User updated'); setEditTarget(null); load() }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try { await usersApi.delete(deleteTarget.id); setSuccess('User deactivated'); setDeleteTarget(null); load() }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setDeleteLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:600, color:'#0f172a', margin:0 }}>User Management</h1>
        <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.25rem' }}>Manage roles, status and access levels</p>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { label:'Total Users', value: stats.total },
            { label:'Active',      value: stats.active },
            ...stats.byRole.map(r => ({ label: r.role.charAt(0).toUpperCase()+r.role.slice(1)+'s', value: r.count }))
          ].map((s,i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', padding:'1rem 1.25rem', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
              <p style={{ fontSize:'1.5rem', fontWeight:700, color:'#0f172a', margin:'0 0 0.125rem', fontFamily:'monospace' }}>{s.value}</p>
              <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', padding:'1rem', marginBottom:'1rem', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'0.75rem' }}>
          <div style={{ position:'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)' }} />
            <input className="input" placeholder="Search name or email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ paddingLeft:'2.25rem' }} />
          </div>
          <select className="input" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'1rem', overflow:'hidden', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        {loading ? <PageLoader /> : users.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'#94a3b8' }}>No users found</div>
          : <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                  {['User','Role','Status','Last Login','Joined','Actions'].map(h => (
                    <th key={h} style={{ padding:'0.875rem 1.25rem', textAlign:'left', fontSize:'0.7rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rb = roleBadge[u.role] || roleBadge.viewer
                  const sb = statusBadge[u.status] || statusBadge.inactive
                  return (
                    <tr key={u.id} style={{ borderBottom:'1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#4338ca' }}>{u.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p style={{ fontSize:'0.875rem', fontWeight:500, color:'#1e293b', margin:0 }}>
                              {u.name} {u.id === me?.userId && <span style={{ fontSize:'0.7rem', color:'#94a3b8' }}>(you)</span>}
                            </p>
                            <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:0 }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <span style={{ background:rb.bg, color:rb.color, fontSize:'0.7rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'9999px', display:'inline-flex', alignItems:'center', gap:'0.25rem' }}>
                          <Shield size={10} />{u.role}
                        </span>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <span style={{ background:sb.bg, color:sb.color, fontSize:'0.7rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'9999px' }}>{u.status}</span>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.75rem', color:'#94a3b8' }}>{u.last_login ? formatDate(u.last_login) : 'Never'}</td>
                      <td style={{ padding:'0.875rem 1.25rem', fontSize:'0.75rem', color:'#94a3b8' }}>{formatDate(u.created_at)}</td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.25rem' }}>
                          <button style={{ padding:'0.375rem', border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8', borderRadius:'0.5rem', display:'flex' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#eef2ff'; e.currentTarget.style.color='#4f46e5' }}
                            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8' }}
                            onClick={() => { setEditTarget(u); setEditForm({ name:u.name, role:u.role, status:u.status }) }}>
                            <Edit2 size={14} />
                          </button>
                          {u.id !== me?.userId && (
                            <button style={{ padding:'0.375rem', border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8', borderRadius:'0.5rem', display:'flex' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.color='#e11d48' }}
                              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8' }}
                              onClick={() => setDeleteTarget(u)}>
                              <UserX size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
        }
        {meta.totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 1.25rem', borderTop:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Page {page} of {meta.totalPages}</span>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button className="btn-secondary btn-sm" disabled={page<=1} onClick={() => setPage(p=>p-1)}>Prev</button>
              <button className="btn-secondary btn-sm" disabled={page>=meta.totalPages} onClick={() => setPage(p=>p+1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" size="sm">
        <form onSubmit={handleEdit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div><label className="label">Name</label><input className="input" value={editForm.name} onChange={e => setEditForm(f=>({...f,name:e.target.value}))} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={editForm.role} onChange={e => setEditForm(f=>({...f,role:e.target.value}))}>
              <option value="viewer">Viewer</option><option value="analyst">Analyst</option><option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={editForm.status} onChange={e => setEditForm(f=>({...f,status:e.target.value}))}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleteLoading} title="Deactivate User"
        message={`Deactivate ${deleteTarget?.name}? They won't be able to log in until reactivated.`} />
    </div>
  )
}