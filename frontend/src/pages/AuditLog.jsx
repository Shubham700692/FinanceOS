import { useEffect, useState, useCallback } from 'react'
import { Shield, Search } from 'lucide-react'
import { auditApi } from '../api'
import { PageLoader, Alert, Pagination, Empty, Select } from '../components/ui'
import { formatDate, getErrorMessage } from '../utils'

const ACTION_COLORS = {
  REGISTER:      'badge-income',
  LOGIN:         'badge-neutral',
  CREATE_RECORD: 'badge-income',
  UPDATE_RECORD: 'badge-analyst',
  DELETE_RECORD: 'badge-expense',
  UPDATE_USER:   'badge-analyst',
  DELETE_USER:   'badge-expense',
  UPSERT_BUDGET: 'badge-admin',
  DELETE_BUDGET: 'badge-expense',
}

export default function AuditLog() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [action, setAction]   = useState('')
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (action) params.action = action
      const { data } = await auditApi.list(params)
      setLogs(data.data)
      setTotal(data.data.length)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, action])

  useEffect(() => { load() }, [load])

  const ACTIONS = [
    'LOGIN','REGISTER','CREATE_RECORD','UPDATE_RECORD','DELETE_RECORD',
    'UPDATE_USER','DELETE_USER','UPSERT_BUDGET','DELETE_BUDGET',
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Complete trail of all system actions</p>
        </div>
        <div className="flex items-center gap-2 bg-warning-light border border-yellow-200 rounded-xl px-3 py-2">
          <Shield className="h-3.5 w-3.5 text-warning" />
          <span className="text-xs text-warning-dark font-medium">Admin only</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="card p-4 mb-4">
        <Select
          value={action}
          onChange={v => { setAction(v); setPage(1) }}
          options={ACTIONS.map(a => ({ value: a, label: a.replace(/_/g, ' ') }))}
          placeholder="All actions"
          className="w-64"
        />
      </div>

      <div className="table-wrapper">
        {loading ? <PageLoader /> : logs.length === 0 ? (
          <Empty title="No audit logs" subtitle="Actions will appear here as users interact with the system" icon={Shield} />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Resource ID</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-xs text-surface-500 whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <p className="text-xs font-medium text-surface-800">{log.user_name || '—'}</p>
                      <p className="text-xs text-surface-400">{log.user_email}</p>
                    </td>
                    <td>
                      <span className={ACTION_COLORS[log.action] || 'badge-neutral'} style={{ fontSize: '10px' }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="text-xs capitalize text-surface-600">
                      {log.resource_type?.replace(/_/g, ' ')}
                    </td>
                    <td className="font-mono text-xs text-surface-400 max-w-xs truncate">
                      {log.resource_id ? log.resource_id.slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="font-mono text-xs text-surface-400">{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(total / limit) || 1} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  )
}