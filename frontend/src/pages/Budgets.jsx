import { useEffect, useState } from 'react'
import { Plus, Trash2, Target, TrendingDown } from 'lucide-react'
import { budgetsApi, dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Confirm, Modal, Spinner, Empty } from '../components/ui'
import { formatCurrency, CATEGORIES, getErrorMessage, cn } from '../utils'

const STATUS = {
  over_budget: { label: 'Over Budget', cls: 'badge-expense' },
  warning:     { label: 'Warning',     cls: 'badge-warning' },
  on_track:    { label: 'On Track',    cls: 'badge-income'  },
  no_budget:   { label: 'No Budget',   cls: 'badge-neutral' },
}

export default function Budgets() {
  const { isAdmin } = useAuth()
  const [analysis, setAnalysis]   = useState([])
  const [budgets, setBudgets]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [form, setForm] = useState({ category: '', monthly_limit: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [a, b] = await Promise.all([
        dashboardApi.budgetAnalysis(),
        budgetsApi.list(),
      ])
      setAnalysis(a.data.data)
      setBudgets(b.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await budgetsApi.upsert({ category: form.category, monthly_limit: parseFloat(form.monthly_limit) })
      setSuccess('Budget saved!')
      setModalOpen(false)
      setForm({ category: '', monthly_limit: '' })
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
      await budgetsApi.delete(deleteTarget.category)
      setSuccess('Budget removed')
      setDeleteTarget(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <PageLoader />

  const overBudget = analysis.filter(a => a.status === 'over_budget').length
  const onTrack    = analysis.filter(a => a.status === 'on_track').length

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Monthly spending limits by category</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Set Budget
          </button>
        )}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   className="mb-4" />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

      {/* Summary pills */}
      {analysis.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="card px-4 py-3 flex items-center gap-3">
            <Target className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-xs text-surface-400">Active Budgets</p>
              <p className="text-sm font-semibold">{budgets.length}</p>
            </div>
          </div>
          <div className="card px-4 py-3 flex items-center gap-3">
            <div className={cn('w-2 h-2 rounded-full', overBudget > 0 ? 'bg-expense' : 'bg-income')} />
            <div>
              <p className="text-xs text-surface-400">Over Budget</p>
              <p className="text-sm font-semibold">{overBudget} categories</p>
            </div>
          </div>
          <div className="card px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-income" />
            <div>
              <p className="text-xs text-surface-400">On Track</p>
              <p className="text-sm font-semibold">{onTrack} categories</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget analysis cards */}
      {analysis.length === 0 ? (
        <div className="card">
          <Empty title="No budget data" subtitle="Set category budgets to track spending" icon={Target} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {analysis.map(b => {
            const st = STATUS[b.status] || STATUS.no_budget
            const pct = Math.min(b.utilization_percent ?? 0, 100)
            const hasBudget = b.budget !== null
            return (
              <div key={b.category} className="card p-5 hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-surface-800 capitalize">{b.category}</p>
                    {hasBudget && (
                      <p className="text-xs text-surface-400 mt-0.5">
                        Limit: {formatCurrency(b.budget)} / month
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={st.cls}>{st.label}</span>
                    {isAdmin && hasBudget && (
                      <button
                        className="p-1 rounded hover:bg-expense-light text-surface-300 hover:text-expense transition-colors"
                        onClick={() => setDeleteTarget(b)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {hasBudget && (
                  <div className="mb-3">
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500',
                          b.status === 'over_budget' ? 'bg-expense' :
                          b.status === 'warning' ? 'bg-warning' : 'bg-income'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-surface-400">{b.utilization_percent}% used</span>
                      {b.remaining !== null && (
                        <span className={cn('text-xs font-medium', b.remaining < 0 ? 'text-expense' : 'text-income')}>
                          {b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(Math.abs(b.remaining))} over`}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingDown className="h-3.5 w-3.5 text-expense" />
                  <span className="text-xs text-surface-500">Spent this month:</span>
                  <span className="text-xs font-semibold text-surface-800 font-mono">{formatCurrency(b.spent)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Set budget modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set Monthly Budget" size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select className="input" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit (₹)</label>
            <input
              type="number" className="input" required min="1" step="1"
              placeholder="e.g. 15000"
              value={form.monthly_limit}
              onChange={e => setForm(f => ({ ...f, monthly_limit: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Budget"
        message={`Remove the budget for "${deleteTarget?.category}"?`}
      />
    </div>
  )
}