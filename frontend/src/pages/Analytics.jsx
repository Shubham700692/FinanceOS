import { useEffect, useState } from 'react'
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { dashboardApi } from '../api'
import { PageLoader, Alert, Select } from '../components/ui'
import { formatCurrency, formatMonth, getErrorMessage, CATEGORY_COLORS } from '../utils'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card-hover px-4 py-3 text-xs">
      <p className="font-medium text-surface-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-surface-500 capitalize">{p.dataKey}:</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card-hover px-3 py-2 text-xs">
      <p className="font-medium capitalize">{d.name}</p>
      <p className="text-surface-500">{formatCurrency(d.value)} · {d.payload.percentage}%</p>
    </div>
  )
}

export default function Analytics() {
  const [monthly, setMonthly]   = useState([])
  const [weekly, setWeekly]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [months, setMonths]     = useState('12')
  const [catType, setCatType]   = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [m, w, c] = await Promise.all([
        dashboardApi.monthlyTrends({ months }),
        dashboardApi.weeklyTrends({ weeks: 8 }),
        dashboardApi.categories({ type: catType || undefined }),
      ])
      setMonthly(m.data.data.map(d => ({ ...d, month: formatMonth(d.month) })))
      setWeekly(w.data.data.map(d => ({ ...d, week: d.week?.slice(-3) || d.week })))
      setCategories(c.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [months, catType])

  const incomeData  = categories.filter(c => c.type === 'income')
  const expenseData = categories.filter(c => c.type === 'expense')

  if (loading) return <PageLoader />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Trends and breakdowns across time</p>
        </div>
        <Select
          value={months}
          onChange={setMonths}
          options={[{ value: '3', label: '3 months' }, { value: '6', label: '6 months' }, { value: '12', label: '12 months' }]}
          placeholder={null}
          className="w-36"
        />
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

      {/* Monthly income vs expense bar chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-surface-800 mb-1">Monthly Income vs Expenses</h2>
        <p className="text-xs text-surface-400 mb-5">Side by side comparison</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} barGap={4} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Bar dataKey="income"  fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net balance line chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-surface-800 mb-1">Net Balance Trend</h2>
        <p className="text-xs text-surface-400 mb-5">Monthly net (income − expenses)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly area chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-surface-800 mb-1">Weekly Activity</h2>
        <p className="text-xs text-surface-400 mb-5">Last 8 weeks</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="wIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="wExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fill="url(#wIncome)"  />
            <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#wExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown pie charts */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-surface-800">Category Breakdown</h2>
        <Select
          value={catType}
          onChange={setCatType}
          options={[{ value: 'income', label: 'Income only' }, { value: 'expense', label: 'Expense only' }]}
          placeholder="All types"
          className="w-40"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[{ label: 'Income by Category', data: incomeData }, { label: 'Expenses by Category', data: expenseData }]
          .filter(g => !catType || (catType === 'income' ? g.data === incomeData : g.data === expenseData))
          .map(({ label, data }) => (
          <div key={label} className="card p-6">
            <h3 className="text-sm font-semibold text-surface-800 mb-4">{label}</h3>
            {data.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-surface-400">No data</div>
            ) : (
              <div className="flex gap-6 items-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={data} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {data.map((entry) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data.slice(0, 6).map(d => (
                    <div key={d.category} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: CATEGORY_COLORS[d.category] || '#9ca3af' }} />
                      <span className="text-xs text-surface-600 capitalize flex-1 truncate">{d.category}</span>
                      <span className="text-xs font-medium text-surface-700">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}