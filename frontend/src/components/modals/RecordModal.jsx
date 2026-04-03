import { useState, useEffect } from 'react'
import { recordsApi } from '../../api'
import { Modal, Alert, Spinner } from '../ui'
import { CATEGORIES, getErrorMessage } from '../../utils'

const today = () => new Date().toISOString().split('T')[0]

const empty = { amount: '', type: 'expense', category: '', date: today(), description: '', tags: '' }

export default function RecordModal({ open, onClose, onSaved, record }) {
  const [form, setForm]     = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const isEdit = !!record

  useEffect(() => {
    if (record) {
      setForm({
        amount:      record.amount ?? '',
        type:        record.type ?? 'expense',
        category:    record.category ?? '',
        date:        record.date ?? today(),
        description: record.description ?? '',
        tags:        Array.isArray(record.tags) ? record.tags.join(', ') : '',
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [record, open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        amount:      parseFloat(form.amount),
        type:        form.type,
        category:    form.category,
        date:        form.date,
        description: form.description || undefined,
        tags:        form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (isEdit) {
        await recordsApi.update(record.id, payload)
      } else {
        await recordsApi.create(payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Record' : 'New Record'}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit} className="space-y-4 mt-3">
        {/* Type toggle */}
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {['income', 'expense'].map(t => (
              <button
                key={t} type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-income-light border-income text-income-dark'
                      : 'bg-expense-light border-expense text-expense-dark'
                    : 'bg-surface-50 border-surface-200 text-surface-500 hover:bg-surface-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Amount (₹)</label>
            <input
              type="number" className="input" required min="0.01" step="0.01"
              placeholder="0.00" value={form.amount} onChange={set('amount')}
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" required value={form.date} onChange={set('date')} />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <select className="input" required value={form.category} onChange={set('category')}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Description <span className="text-surface-300">(optional)</span></label>
          <input
            type="text" className="input"
            placeholder="e.g. Monthly rent payment"
            value={form.description} onChange={set('description')}
          />
        </div>

        <div>
          <label className="label">Tags <span className="text-surface-300">(comma separated)</span></label>
          <input
            type="text" className="input"
            placeholder="e.g. recurring, work, home"
            value={form.tags} onChange={set('tags')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : isEdit ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </form>
    </Modal>
  )
}