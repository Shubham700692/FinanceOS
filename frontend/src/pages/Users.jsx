import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, UserX, Search, Shield } from 'lucide-react'
import { usersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Confirm, Modal, Spinner, Empty, Select, Pagination } from '../components/ui'
import { formatDate, getErrorMessage, ROLE_COLORS, cn } from '../utils'

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers]       = useState([])
  const [stats, setStats]       = useState(null)
  const [meta, setMeta]         = useState({})
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)

  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', role: '', status: '' })
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter
      const [u, s] = await Promise.all([usersApi.list(params), usersApi.stats()])
      setUsers(u.data.data)
      setMeta(u.data.meta || {})
      setStats(s.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const openEdit = (u) => {
    setEditTarget(u)
    setEditForm({ name: u.name, role: u.role, status: u.status })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.update(editTarget.id, editForm)
      setSuccess('User updated')
      setEditTarget(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await usersApi.delete(deleteTarget.id)
      setSuccess('User deactivated')
      setDeleteTarget(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage roles, status and access levels</p>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   className="mb-4" />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.total },
            { label: 'Active',      value: stats.active },
            ...stats.byRole.map(r => ({ label: r.role.charAt(0).toUpperCase() + r.role.slice(1) + 's', value: r.count })),
          ].map(s => (
            <div key={s.label} className="card px-4 py-3">
              <p className="text-xl font-bold text-surface-900">{s.value}</p>
              <p className="text-xs text-surface-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-300" />
            <input className="input pl-9" placeholder="Search name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <Select value={roleFilter} onChange={v => { setRoleFilter(v); setPage(1) }}
            options={[{ value: 'admin', label: 'Admin' }, { value: 'analyst', label: 'Analyst' }, { value: 'viewer', label: 'Viewer' }]}
            placeholder="All roles" />
          <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1) }}
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
            placeholder="All statuses" />
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? <PageLoader /> : users.length === 0 ? (
          <Empty title="No users found" />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-brand-700">{u.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-800">{u.name} {u.id === me?.userId && <span className="text-xs text-surface-400">(you)</span>}</p>
                          <p className="text-xs text-surface-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={ROLE_COLORS[u.role]}>
                        <Shield className="h-2.5 w-2.5" />{u.role}
                      </span>
                    </td>
                    <td>
                      <span className={u.status === 'active' ? 'badge-income' : 'badge-neutral'}>{u.status}</span>
                    </td>
                    <td className="text-xs text-surface-400">{u.last_login ? formatDate(u.last_login) : 'Never'}</td>
                    <td className="text-xs text-surface-400">{formatDate(u.created_at)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600 transition-colors" onClick={() => openEdit(u)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {u.id !== me?.userId && (
                          <button className="p-1.5 rounded-lg hover:bg-expense-light text-surface-400 hover:text-expense transition-colors" onClick={() => setDeleteTarget(u)}>
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={meta.totalPages || 1} onPage={setPage} />
          </>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" size="sm">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Deactivate User"
        message={`Deactivate ${deleteTarget?.name}? They won't be able to log in until reactivated.`}
      />
    </div>
  )
}