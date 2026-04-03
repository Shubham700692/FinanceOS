import { X, AlertTriangle, Info, CheckCircle, XCircle, Inbox } from 'lucide-react'
import { cn } from '../../utils'

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]
  return (
    <svg className={cn('animate-spin text-brand-500', s, className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
)

// ── Empty State ───────────────────────────────────────────────────────────────
export const Empty = ({ title = 'No data', subtitle = '', icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 bg-surface-100 rounded-2xl mb-4">
      <Icon className="h-8 w-8 text-surface-400" />
    </div>
    <p className="text-sm font-medium text-surface-700">{title}</p>
    {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
  </div>
)

// ── Alert ─────────────────────────────────────────────────────────────────────
const alertConfig = {
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   Icon: Info },
  success: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  Icon: CheckCircle },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', Icon: AlertTriangle },
  error:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    Icon: XCircle },
}

export const Alert = ({ type = 'info', message, onClose }) => {
  const { bg, border, text, Icon } = alertConfig[type] || alertConfig.info
  if (!message) return null
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border text-sm', bg, border, text, 'animate-slide-up')}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-xl w-full animate-slide-up', widths[size])}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <h2 className="text-base font-semibold text-surface-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-surface-600 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      <button className="btn-danger" onClick={onConfirm} disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Confirm'}
      </button>
    </div>
  </Modal>
)

// ── Pagination ────────────────────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-surface-100">
      <span className="text-xs text-surface-400">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
        <button className="btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = ({ label, value, onChange, options, placeholder = 'All', className = '' }) => (
  <div className={className}>
    {label && <label className="label">{label}</label>}
    <select className="input" value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </div>
)

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ title, value, sub, icon: Icon, color = 'brand', trend }) => {
  const colors = {
    brand:   { bg: 'bg-brand-50',   icon: 'text-brand-600'   },
    income:  { bg: 'bg-income-light',  icon: 'text-income'   },
    expense: { bg: 'bg-expense-light', icon: 'text-expense'  },
    warning: { bg: 'bg-warning-light', icon: 'text-warning'  },
  }
  const c = colors[color] || colors.brand
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-xl', c.bg)}>
          <Icon className={cn('h-5 w-5', c.icon)} />
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium px-2 py-1 rounded-lg',
            trend >= 0 ? 'text-income bg-income-light' : 'text-expense bg-expense-light')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-surface-900 font-mono">{value}</p>
        <p className="text-xs text-surface-400 mt-0.5">{title}</p>
        {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}