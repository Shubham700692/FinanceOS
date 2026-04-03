import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react'
import { recordsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { PageLoader, Alert, Pagination, Select, Confirm, Empty } from '../components/ui'
import RecordModal from '../components/modals/RecordModal'
import { formatCurrency, formatDate, CATEGORIES, getErrorMessage, cn } from '../utils'

export default function Records() {
  const { isAnalyst, isAdmin } = useAuth()
  const [records, setRecords]     = useState([])
  const [meta, setMeta]           = useState({})
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Filters
  const [filters, setFilters] = useState({
    page: 1, limit: 20, type: '', category: '',
    from: '', to: '', search: '', sortBy: 'date', order: 'desc',
  })

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false)
  const [editRecord, setEditRecord]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const { data } = await recordsApi.list(params)
      setRecords(data.data)
      setMeta(data.meta || {})
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await recordsApi.delete(deleteTarget.id)
      setSuccess('Record deleted successfully')
      setDeleteTarget(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  const clearFilters = () => setFilters({ page: 1, limit: 20, type: '', category: '', from: '', to: '', search: '', sortBy: 'date', order: 'desc' })
  const hasFilters = filters.type || filters.category || filters.from || filters.to || filters.search

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Records</h1>
          <p className="page-subtitle">
            {meta.total != null ? `${meta.total} records total` : 'All your transactions'}
          </p>
        </div>
        {isAnalyst && (
          <button className="btn-primary" onClick={() => { setEditRecord(null); setModalOpen(true) }}>
            <Plus className="h-4 w-4" /> New Record
          </button>
        )}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   className="mb-4" />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

      {/* Filter bar */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-300" />
            <input
              className="input pl-9" placeholder="Search description or category…"
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>
          <Select
            value={filters.type}
            onChange={v => setFilter('type', v)}
            options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
            placeholder="All types"
          />
          <Select
            value={filters.category}
            onChange={v => setFilter('category', v)}
            options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            placeholder="All categories"
          />
          <input type="date" className="input" value={filters.from} onChange={e => setFilter('from', e.target.value)} placeholder="From" />
          <input type="date" className="input" value={filters.to}   onChange={e => setFilter('to',   e.target.value)} placeholder="To" />
        </div>
        {hasFilters && (
          <button className="mt-3 text-xs text-surface-400 hover:text-surface-700 flex items-center gap-1 transition-colors" onClick={clearFilters}>
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-400">Sort by:</span>
          {['date', 'amount', 'category'].map(s => (
            <button
              key={s}
              onClick={() => {
                if (filters.sortBy === s) setFilter('order', filters.order === 'asc' ? 'desc' : 'asc')
                else { setFilters(f => ({ ...f, sortBy: s, order: 'desc', page: 1 })) }
              }}
              className={cn('text-xs px-2.5 py-1 rounded-lg capitalize transition-colors',
                filters.sortBy === s
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-surface-500 hover:text-surface-700'
              )}
            >
              {s} {filters.sortBy === s ? (filters.order === 'desc' ? '↓' : '↑') : ''}
            </button>
          ))}
        </div>
        <Select
          value={filters.limit}
          onChange={v => setFilters(f => ({ ...f, limit: v, page: 1 }))}
          options={[10, 20, 50].map(v => ({ value: v, label: `${v} / page` }))}
          placeholder={null}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <PageLoader />
        ) : records.length === 0 ? (
          <Empty title="No records found" subtitle={hasFilters ? 'Try adjusting your filters' : 'Create your first record'} />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Tags</th>
                  <th className="text-right">Amount</th>
                  {isAnalyst && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id}>
                    <td className="text-xs text-surface-500 whitespace-nowrap">{formatDate(rec.date)}</td>
                    <td>
                      <span className={rec.type === 'income' ? 'badge-income' : 'badge-expense'}>
                        {rec.type === 'income'
                          ? <TrendingUp className="h-2.5 w-2.5" />
                          : <TrendingDown className="h-2.5 w-2.5" />
                        }
                        {rec.type}
                      </span>
                    </td>
                    <td className="capitalize text-surface-600">{rec.category}</td>
                    <td className="text-surface-500 max-w-xs truncate">{rec.description || '—'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {rec.tags?.slice(0, 2).map(t => (
                          <span key={t} className="badge-neutral text-xs">{t}</span>
                        ))}
                        {rec.tags?.length > 2 && <span className="badge-neutral">+{rec.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className={`text-right font-semibold font-mono whitespace-nowrap ${
                      rec.type === 'income' ? 'text-income' : 'text-expense'
                    }`}>
                      {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount)}
                    </td>
                    {isAnalyst && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600 transition-colors"
                            onClick={() => { setEditRecord(rec); setModalOpen(true) }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-expense-light text-surface-400 hover:text-expense transition-colors"
                            onClick={() => setDeleteTarget(rec)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={filters.page}
              totalPages={meta.totalPages || 1}
              onPage={p => setFilters(f => ({ ...f, page: p }))}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <RecordModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditRecord(null) }}
        onSaved={() => { load(); setSuccess(editRecord ? 'Record updated!' : 'Record created!') }}
        record={editRecord}
      />
      <Confirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Record"
        message={`Are you sure you want to delete this ${deleteTarget?.type} of ${formatCurrency(deleteTarget?.amount)}? This action cannot be undone.`}
      />
    </div>
  )
}