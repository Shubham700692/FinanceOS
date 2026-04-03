import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Wallet, Activity,
  ArrowRight, 
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { StatCard, PageLoader, Alert } from '../components/ui'
import { formatCurrency, formatMonth, formatDate, getErrorMessage, CATEGORY_COLORS } from '../utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card-hover px-4 py-3 text-xs">
      <p className="font-medium text-surface-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-surface-500 capitalize">{p.dataKey}:</span>
          <span className="font-medium text-surface-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, isAnalyst } = useAuth()
  const [summary, setSummary]   = useState(null)
  const [trends, setTrends]     = useState([])
  const [activity, setActivity] = useState([])
  const [budget, setBudget]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, a, b] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.monthlyTrends({ months: 6 }),
          dashboardApi.activity({ limit: 8 }),
          dashboardApi.budgetAnalysis(),
        ])
        setSummary(s.data.data)
        setTrends(t.data.data.map(d => ({ ...d, month: formatMonth(d.month) })))
        setActivity(a.data.data)
        setBudget(b.data.data.slice(0, 5))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="animate-fade-in">
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <div className="text-xs text-surface-400 bg-white border border-surface-200 rounded-xl px-3 py-2">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

    
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Income"
            value={formatCurrency(summary.income.total)}
            sub={`${summary.income.count} transactions`}
            icon={TrendingUp}
            color="income"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary.expense.total)}
            sub={`${summary.expense.count} transactions`}
            icon={TrendingDown}
            color="expense"
          />
          <StatCard
            title="Net Balance"
            value={formatCurrency(summary.net_balance)}
            sub={summary.net_balance >= 0 ? 'You\'re in the green' : 'Overspent'}
            icon={Wallet}
            color={summary.net_balance >= 0 ? 'brand' : 'expense'}
          />
          <StatCard
            title="Savings Rate"
            value={`${summary.savings_rate}%`}
            sub={`${summary.total_records} total records`}
            icon={Activity}
            color={summary.savings_rate >= 20 ? 'income' : 'warning'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-surface-800">Monthly Overview</h2>
              <p className="text-xs text-surface-400 mt-0.5">Last 6 months income vs expenses</p>
            </div>
            <Link to="/analytics" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Full view <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {trends.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-surface-400">No trend data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fill="url(#gIncome)"  />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

    
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-surface-800">Budget Status</h2>
              <p className="text-xs text-surface-400 mt-0.5">This month</p>
            </div>
            <Link to="/budgets" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {budget.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-xs text-surface-400">No budgets set</p>
              <Link to="/budgets" className="text-xs text-brand-600 mt-2 hover:underline">Set a budget →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {budget.map(b => (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-surface-700 capitalize">{b.category}</span>
                    <span className={`text-xs font-medium ${
                      b.status === 'over_budget' ? 'text-expense' :
                      b.status === 'warning' ? 'text-warning' : 'text-income'
                    }`}>
                      {b.utilization_percent ?? 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.status === 'over_budget' ? 'bg-expense' :
                        b.status === 'warning' ? 'bg-warning' : 'bg-income'
                      }`}
                      style={{ width: `${Math.min(b.utilization_percent ?? 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-surface-400">{formatCurrency(b.spent)} spent</span>
                    {b.budget && <span className="text-xs text-surface-400">of {formatCurrency(b.budget)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

  
      <div className="card">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <div>
            <h2 className="text-sm font-semibold text-surface-800">Recent Activity</h2>
            <p className="text-xs text-surface-400 mt-0.5">Latest financial transactions</p>
          </div>
          <Link to="/records" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {activity.length === 0 ? (
          <div className="py-12 text-center text-sm text-surface-400">No records yet</div>
        ) : (
          <div className="divide-y divide-surface-50">
            {activity.map(rec => (
              <div key={rec.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  rec.type === 'income' ? 'bg-income-light' : 'bg-expense-light'
                }`}>
                  {rec.type === 'income'
                    ? <TrendingUp className="h-3.5 w-3.5 text-income" />
                    : <TrendingDown className="h-3.5 w-3.5 text-expense" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 capitalize truncate">
                    {rec.description || rec.category}
                  </p>
                  <p className="text-xs text-surface-400 capitalize">{rec.category} · {formatDate(rec.date)}</p>
                </div>
                <span className={`text-sm font-semibold font-mono ${
                  rec.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}