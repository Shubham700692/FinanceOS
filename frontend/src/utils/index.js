import { clsx } from 'clsx'

export const cn = (...args) => clsx(args)

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount ?? 0)

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatMonth = (monthStr) => {
  if (!monthStr) return ''
  const [y, m] = monthStr.split('-')
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

export const CATEGORIES = [
  'salary','freelance','investment','business','rental',
  'food','transport','housing','utilities','healthcare',
  'entertainment','education','shopping','travel','insurance',
  'taxes','subscriptions','other',
]

export const CATEGORY_COLORS = {
  salary: '#6366f1', freelance: '#8b5cf6', investment: '#06b6d4',
  business: '#0ea5e9', rental: '#14b8a6', food: '#f59e0b',
  transport: '#f97316', housing: '#ef4444', utilities: '#ec4899',
  healthcare: '#10b981', entertainment: '#84cc16', education: '#3b82f6',
  shopping: '#f43f5e', travel: '#a855f7', insurance: '#64748b',
  taxes: '#dc2626', subscriptions: '#7c3aed', other: '#9ca3af',
}

export const ROLE_COLORS = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' }

export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : str

export const getErrorMessage = (err) =>
  err?.response?.data?.error?.message || err?.message || 'Something went wrong'