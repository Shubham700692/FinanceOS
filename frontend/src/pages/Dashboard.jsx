// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import {
//   TrendingUp, TrendingDown, Wallet, Activity,
//   ArrowRight, 
// } from 'lucide-react'
// import {
//   AreaChart, Area, BarChart, Bar,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts'
// import { dashboardApi } from '../api'
// import { useAuth } from '../context/AuthContext'
// import { StatCard, PageLoader, Alert } from '../components/ui'
// import { formatCurrency, formatMonth, formatDate, getErrorMessage, CATEGORY_COLORS } from '../utils'

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null
//   return (
//     <div className="bg-white border border-surface-200 rounded-xl shadow-card-hover px-4 py-3 text-xs">
//       <p className="font-medium text-surface-700 mb-2">{label}</p>
//       {payload.map(p => (
//         <div key={p.dataKey} className="flex items-center gap-2">
//           <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
//           <span className="text-surface-500 capitalize">{p.dataKey}:</span>
//           <span className="font-medium text-surface-800">{formatCurrency(p.value)}</span>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default function Dashboard() {
//   const { user, isAnalyst } = useAuth()
//   const [summary, setSummary]   = useState(null)
//   const [trends, setTrends]     = useState([])
//   const [activity, setActivity] = useState([])
//   const [budget, setBudget]     = useState([])
//   const [loading, setLoading]   = useState(true)
//   const [error, setError]       = useState('')

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [s, t, a, b] = await Promise.all([
//           dashboardApi.summary(),
//           dashboardApi.monthlyTrends({ months: 6 }),
//           dashboardApi.activity({ limit: 8 }),
//           dashboardApi.budgetAnalysis(),
//         ])
//         setSummary(s.data.data)
//         setTrends(t.data.data.map(d => ({ ...d, month: formatMonth(d.month) })))
//         setActivity(a.data.data)
//         setBudget(b.data.data.slice(0, 5))
//       } catch (err) {
//         setError(getErrorMessage(err))
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   if (loading) return <PageLoader />

//   return (
//     <div className="animate-fade-in">
      
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
//           <p className="page-subtitle">Here's your financial overview</p>
//         </div>
//         <div className="text-xs text-surface-400 bg-white border border-surface-200 rounded-xl px-3 py-2">
//           {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
//         </div>
//       </div>

//       {error && <Alert type="error" message={error} className="mb-6" />}

    
//       {summary && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <StatCard
//             title="Total Income"
//             value={formatCurrency(summary.income.total)}
//             sub={`${summary.income.count} transactions`}
//             icon={TrendingUp}
//             color="income"
//           />
//           <StatCard
//             title="Total Expenses"
//             value={formatCurrency(summary.expense.total)}
//             sub={`${summary.expense.count} transactions`}
//             icon={TrendingDown}
//             color="expense"
//           />
//           <StatCard
//             title="Net Balance"
//             value={formatCurrency(summary.net_balance)}
//             sub={summary.net_balance >= 0 ? 'You\'re in the green' : 'Overspent'}
//             icon={Wallet}
//             color={summary.net_balance >= 0 ? 'brand' : 'expense'}
//           />
//           <StatCard
//             title="Savings Rate"
//             value={`${summary.savings_rate}%`}
//             sub={`${summary.total_records} total records`}
//             icon={Activity}
//             color={summary.savings_rate >= 20 ? 'income' : 'warning'}
//           />
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    
//         <div className="card p-6 lg:col-span-2">
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <h2 className="text-sm font-semibold text-surface-800">Monthly Overview</h2>
//               <p className="text-xs text-surface-400 mt-0.5">Last 6 months income vs expenses</p>
//             </div>
//             <Link to="/analytics" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
//               Full view <ArrowRight className="h-3 w-3" />
//             </Link>
//           </div>
//           {trends.length === 0 ? (
//             <div className="h-48 flex items-center justify-center text-sm text-surface-400">No trend data yet</div>
//           ) : (
//             <ResponsiveContainer width="100%" height={200}>
//               <AreaChart data={trends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
//                     <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
//                     <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
//                 <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
//                 <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Area type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fill="url(#gIncome)"  />
//                 <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExpense)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           )}
//         </div>

    
//         <div className="card p-6">
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <h2 className="text-sm font-semibold text-surface-800">Budget Status</h2>
//               <p className="text-xs text-surface-400 mt-0.5">This month</p>
//             </div>
//             <Link to="/budgets" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
//               Manage <ArrowRight className="h-3 w-3" />
//             </Link>
//           </div>
//           {budget.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-40 text-center">
//               <p className="text-xs text-surface-400">No budgets set</p>
//               <Link to="/budgets" className="text-xs text-brand-600 mt-2 hover:underline">Set a budget →</Link>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {budget.map(b => (
//                 <div key={b.category}>
//                   <div className="flex items-center justify-between mb-1.5">
//                     <span className="text-xs font-medium text-surface-700 capitalize">{b.category}</span>
//                     <span className={`text-xs font-medium ${
//                       b.status === 'over_budget' ? 'text-expense' :
//                       b.status === 'warning' ? 'text-warning' : 'text-income'
//                     }`}>
//                       {b.utilization_percent ?? 0}%
//                     </span>
//                   </div>
//                   <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
//                     <div
//                       className={`h-full rounded-full transition-all ${
//                         b.status === 'over_budget' ? 'bg-expense' :
//                         b.status === 'warning' ? 'bg-warning' : 'bg-income'
//                       }`}
//                       style={{ width: `${Math.min(b.utilization_percent ?? 0, 100)}%` }}
//                     />
//                   </div>
//                   <div className="flex justify-between mt-1">
//                     <span className="text-xs text-surface-400">{formatCurrency(b.spent)} spent</span>
//                     {b.budget && <span className="text-xs text-surface-400">of {formatCurrency(b.budget)}</span>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

  
//       <div className="card">
//         <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
//           <div>
//             <h2 className="text-sm font-semibold text-surface-800">Recent Activity</h2>
//             <p className="text-xs text-surface-400 mt-0.5">Latest financial transactions</p>
//           </div>
//           <Link to="/records" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
//             View all <ArrowRight className="h-3 w-3" />
//           </Link>
//         </div>
//         {activity.length === 0 ? (
//           <div className="py-12 text-center text-sm text-surface-400">No records yet</div>
//         ) : (
//           <div className="divide-y divide-surface-50">
//             {activity.map(rec => (
//               <div key={rec.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-50 transition-colors">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
//                   rec.type === 'income' ? 'bg-income-light' : 'bg-expense-light'
//                 }`}>
//                   {rec.type === 'income'
//                     ? <TrendingUp className="h-3.5 w-3.5 text-income" />
//                     : <TrendingDown className="h-3.5 w-3.5 text-expense" />
//                   }
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-surface-800 capitalize truncate">
//                     {rec.description || rec.category}
//                   </p>
//                   <p className="text-xs text-surface-400 capitalize">{rec.category} · {formatDate(rec.date)}</p>
//                 </div>
//                 <span className={`text-sm font-semibold font-mono ${
//                   rec.type === 'income' ? 'text-income' : 'text-expense'
//                 }`}>
//                   {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// const getGreeting = () => {
//   const h = new Date().getHours()
//   if (h < 12) return 'morning'
//   if (h < 17) return 'afternoon'
//   return 'evening'
// }


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { StatCard, PageLoader, Alert } from '../components/ui'
import { formatCurrency, formatMonth, formatDate, getErrorMessage } from '../utils'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.75rem', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)' }}>
      <p style={{ fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{p.dataKey}:</span>
          <span style={{ fontWeight: 500 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening' }

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary]   = useState(null)
  const [trends, setTrends]     = useState([])
  const [activity, setActivity] = useState([])
  const [budget, setBudget]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.monthlyTrends({ months: 6 }),
      dashboardApi.activity({ limit: 8 }),
      dashboardApi.budgetAnalysis(),
    ]).then(([s, t, a, b]) => {
      setSummary(s.data.data)
      setTrends(t.data.data.map(d => ({ ...d, month: formatMonth(d.month) })))
      setActivity(a.data.data)
      setBudget(b.data.data.slice(0, 5))
    }).catch(err => setError(getErrorMessage(err)))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Here's your financial overview</p>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.5rem 0.75rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stat Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard title="Total Income"   value={formatCurrency(summary.income.total)}  sub={`${summary.income.count} transactions`}  icon={TrendingUp}  color="income" />
          <StatCard title="Total Expenses" value={formatCurrency(summary.expense.total)} sub={`${summary.expense.count} transactions`} icon={TrendingDown} color="expense" />
          <StatCard title="Net Balance"    value={formatCurrency(summary.net_balance)}   sub={summary.net_balance >= 0 ? "You're in the green" : 'Overspent'} icon={Wallet} color={summary.net_balance >= 0 ? 'indigo' : 'expense'} />
          <StatCard title="Savings Rate"   value={`${summary.savings_rate}%`} sub={`${summary.total_records} total records`} icon={Activity} color={summary.savings_rate >= 20 ? 'income' : 'warning'} />
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Monthly trend */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Monthly Overview</h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Last 6 months income vs expenses</p>
            </div>
            <Link to="/analytics" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Full view <ArrowRight size={12} />
            </Link>
          </div>
          {trends.length === 0
            ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No trend data yet</div>
            : <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.15}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/><stop offset="95%" stopColor="#e11d48" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="income"  stroke="#059669" strokeWidth={2} fill="url(#gI)" />
                  <Area type="monotone" dataKey="expense" stroke="#e11d48" strokeWidth={2} fill="url(#gE)" />
                </AreaChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Budget */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Budget Status</h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>This month</p>
            </div>
            <Link to="/budgets" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none' }}>Manage →</Link>
          </div>
          {budget.length === 0
            ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 160, justifyContent: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No budgets set</p>
                <Link to="/budgets" style={{ fontSize: '0.75rem', color: '#4f46e5', marginTop: '0.5rem' }}>Set a budget →</Link>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {budget.map(b => {
                  const color = b.status === 'over_budget' ? '#e11d48' : b.status === 'warning' ? '#d97706' : '#059669'
                  return (
                    <div key={b.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#334155', textTransform: 'capitalize' }}>{b.category}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color }}>{b.utilization_percent ?? 0}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(b.utilization_percent ?? 0, 100)}%`, background: color, borderRadius: 9999, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{formatCurrency(b.spent)} spent</span>
                        {b.budget && <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>of {formatCurrency(b.budget)}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Recent Activity</h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Latest transactions</p>
          </div>
          <Link to="/records" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none' }}>View all →</Link>
        </div>
        {activity.length === 0
          ? <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No records yet</div>
          : activity.map(rec => (
              <div key={rec.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: rec.type === 'income' ? '#d1fae5' : '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {rec.type === 'income' ? <TrendingUp size={14} color="#059669" /> : <TrendingDown size={14} color="#e11d48" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{rec.description || rec.category}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize', margin: 0 }}>{rec.category} · {formatDate(rec.date)}</p>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace', color: rec.type === 'income' ? '#059669' : '#e11d48', whiteSpace: 'nowrap' }}>
                  {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount)}
                </span>
              </div>
            ))
        }
      </div>
    </div>
  )
}