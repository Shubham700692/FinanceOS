// import { X, AlertTriangle, Info, CheckCircle, XCircle, Inbox } from 'lucide-react'
// import { cn } from '../../utils'


// export const Spinner = ({ size = 'md', className = '' }) => {
//   const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]
//   return (
//     <svg className={cn('animate-spin text-brand-500', s, className)} fill="none" viewBox="0 0 24 24">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//     </svg>
//   )
// }

// export const PageLoader = () => (
//   <div className="flex items-center justify-center h-64">
//     <Spinner size="lg" />
//   </div>
// )


// export const Empty = ({ title = 'No data', subtitle = '', icon: Icon = Inbox }) => (
//   <div className="flex flex-col items-center justify-center py-16 text-center">
//     <div className="p-4 bg-surface-100 rounded-2xl mb-4">
//       <Icon className="h-8 w-8 text-surface-400" />
//     </div>
//     <p className="text-sm font-medium text-surface-700">{title}</p>
//     {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
//   </div>
// )


// const alertConfig = {
//   info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   Icon: Info },
//   success: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  Icon: CheckCircle },
//   warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', Icon: AlertTriangle },
//   error:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    Icon: XCircle },
// }

// export const Alert = ({ type = 'info', message, onClose }) => {
//   const { bg, border, text, Icon } = alertConfig[type] || alertConfig.info
//   if (!message) return null
//   return (
//     <div className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border text-sm', bg, border, text, 'animate-slide-up')}>
//       <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
//       <span className="flex-1">{message}</span>
//       {onClose && (
//         <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
//           <X className="h-3.5 w-3.5" />
//         </button>
//       )}
//     </div>
//   )
// }


// export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
//   if (!open) return null
//   const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
//       <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
//       <div className={cn('relative bg-white rounded-2xl shadow-xl w-full animate-slide-up', widths[size])}>
//         <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
//           <h2 className="text-base font-semibold text-surface-900">{title}</h2>
//           <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//         <div className="px-6 py-5">{children}</div>
//       </div>
//     </div>
//   )
// }


// export const Confirm = ({ open, onClose, onConfirm, title, message, loading }) => (
//   <Modal open={open} onClose={onClose} title={title} size="sm">
//     <p className="text-sm text-surface-600 mb-6">{message}</p>
//     <div className="flex justify-end gap-3">
//       <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
//       <button className="btn-danger" onClick={onConfirm} disabled={loading}>
//         {loading ? <Spinner size="sm" /> : 'Confirm'}
//       </button>
//     </div>
//   </Modal>
// )


// export const Pagination = ({ page, totalPages, onPage }) => {
//   if (totalPages <= 1) return null
//   return (
//     <div className="flex items-center justify-between px-5 py-4 border-t border-surface-100">
//       <span className="text-xs text-surface-400">Page {page} of {totalPages}</span>
//       <div className="flex gap-2">
//         <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
//         <button className="btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
//       </div>
//     </div>
//   )
// }


// export const Select = ({ label, value, onChange, options, placeholder = 'All', className = '' }) => (
//   <div className={className}>
//     {label && <label className="label">{label}</label>}
//     <select className="input" value={value} onChange={e => onChange(e.target.value)}>
//       {placeholder && <option value="">{placeholder}</option>}
//       {options.map(o => (
//         <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
//       ))}
//     </select>
//   </div>
// )


// export const StatCard = ({ title, value, sub, icon: Icon, color = 'brand', trend }) => {
//   const colors = {
//     brand:   { bg: 'bg-brand-50',   icon: 'text-brand-600'   },
//     income:  { bg: 'bg-income-light',  icon: 'text-income'   },
//     expense: { bg: 'bg-expense-light', icon: 'text-expense'  },
//     warning: { bg: 'bg-warning-light', icon: 'text-warning'  },
//   }
//   const c = colors[color] || colors.brand
//   return (
//     <div className="stat-card animate-fade-in">
//       <div className="flex items-start justify-between">
//         <div className={cn('p-2.5 rounded-xl', c.bg)}>
//           <Icon className={cn('h-5 w-5', c.icon)} />
//         </div>
//         {trend !== undefined && (
//           <span className={cn('text-xs font-medium px-2 py-1 rounded-lg',
//             trend >= 0 ? 'text-income bg-income-light' : 'text-expense bg-expense-light')}>
//             {trend >= 0 ? '+' : ''}{trend}%
//           </span>
//         )}
//       </div>
//       <div>
//         <p className="text-2xl font-semibold text-surface-900 font-mono">{value}</p>
//         <p className="text-xs text-surface-400 mt-0.5">{title}</p>
//         {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
//       </div>
//     </div>
//   )
// }

import { X, AlertTriangle, Info, CheckCircle, XCircle, Inbox } from 'lucide-react'

const s = {
  // Colors
  indigo:  '#4f46e5', indigoHover: '#4338ca', indigoLight: '#eef2ff', indigoDark: '#3730a3',
  green:   '#059669', greenLight:  '#d1fae5', greenDark:   '#065f46',
  red:     '#e11d48', redLight:    '#ffe4e6', redDark:     '#9f1239',
  amber:   '#d97706', amberLight:  '#fef3c7', amberDark:   '#78350f',
  blue:    '#2563eb', blueLight:   '#dbeafe',
  slate50: '#f8fafc', slate100: '#f1f5f9', slate200: '#e2e8f0',
  slate300: '#cbd5e1', slate400: '#94a3b8', slate500: '#64748b',
  slate600: '#475569', slate700: '#334155', slate800: '#1e293b', slate900: '#0f172a',
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }) => {
  const sz = { sm: 16, md: 24, lg: 32 }[size]
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 1s linear infinite', color: s.indigo }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
      <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  )
}

export const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
    <Spinner size="lg" />
  </div>
)

// ── Empty ─────────────────────────────────────────────────────────────────────
export const Empty = ({ title = 'No data', subtitle = '', icon: Icon = Inbox }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
    <div style={{ padding: '1rem', background: s.slate100, borderRadius: '1rem', marginBottom: '1rem' }}>
      <Icon size={32} color={s.slate400} />
    </div>
    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: s.slate700 }}>{title}</p>
    {subtitle && <p style={{ fontSize: '0.75rem', color: s.slate400, marginTop: '0.25rem' }}>{subtitle}</p>}
  </div>
)

// ── Alert ─────────────────────────────────────────────────────────────────────
const alertCfg = {
  info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', Icon: Info },
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', Icon: CheckCircle },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', Icon: AlertTriangle },
  error:   { bg: '#fff1f2', border: '#fecdd3', color: '#9f1239', Icon: XCircle },
}
export const Alert = ({ type = 'info', message, onClose }) => {
  const c = alertCfg[type] || alertCfg.info
  if (!message) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1px solid ${c.border}`, background: c.bg, color: c.color, fontSize: '0.875rem', marginBottom: '1rem' }}>
      <c.Icon size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, opacity: 0.6, padding: 0 }}><X size={14} /></button>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const widths = { sm: '400px', md: '560px', lg: '720px', xl: '900px' }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 20px 60px rgb(0 0 0 / 0.15)', width: '100%', maxWidth: widths[size], animation: 'slideUp 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: s.slate900, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: s.slate400, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.background = s.slate100}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Confirm ───────────────────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p style={{ fontSize: '0.875rem', color: s.slate600, marginBottom: '1.5rem', margin: '0 0 1.5rem' }}>{message}</p>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
      <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      <button className="btn-danger" onClick={onConfirm} disabled={loading}>{loading ? <Spinner size="sm" /> : 'Confirm'}</button>
    </div>
  </Modal>
)

// ── Pagination ────────────────────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '0.75rem', color: s.slate400 }}>Page {page} of {totalPages}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
)

// ── Stat Card ─────────────────────────────────────────────────────────────────
const colorMap = {
  indigo:  { bg: '#eef2ff', icon: '#4f46e5' },
  income:  { bg: '#d1fae5', icon: '#059669' },
  expense: { bg: '#ffe4e6', icon: '#e11d48' },
  warning: { bg: '#fef3c7', icon: '#d97706' },
}
export const StatCard = ({ title, value, sub, icon: Icon, color = 'indigo', trend }) => {
  const c = colorMap[color] || colorMap.indigo
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ padding: '0.625rem', background: c.bg, borderRadius: '0.75rem', display: 'flex' }}>
          <Icon size={20} color={c.icon} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.25rem 0.5rem', borderRadius: '0.5rem', background: trend >= 0 ? '#d1fae5' : '#ffe4e6', color: trend >= 0 ? '#065f46' : '#9f1239' }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: 600, color: s.slate900, fontFamily: 'JetBrains Mono, monospace', margin: '0 0 0.125rem' }}>{value}</p>
        <p style={{ fontSize: '0.75rem', color: s.slate400, margin: 0 }}>{title}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: s.slate500, marginTop: '0.25rem' }}>{sub}</p>}
      </div>
    </div>
  )
}