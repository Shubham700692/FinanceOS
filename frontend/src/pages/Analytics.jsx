import { useEffect, useState } from 'react'
import { BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { dashboardApi } from '../api'
import { PageLoader, Alert } from '../components/ui'
import { formatCurrency, formatMonth, getErrorMessage, CATEGORY_COLORS } from '../utils'

const card = { background:'#fff', borderRadius:'1rem', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgb(0 0 0/.06)', padding:'1.5rem', marginBottom:'1.5rem' }
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'0.75rem', padding:'0.75rem 1rem', fontSize:'0.75rem', boxShadow:'0 4px 12px rgb(0 0 0/.1)' }}>
      <p style={{ fontWeight:600, color:'#334155', marginBottom:'0.5rem' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, display:'inline-block', flexShrink:0 }} />
          <span style={{ color:'#64748b', textTransform:'capitalize' }}>{p.dataKey}:</span>
          <span style={{ fontWeight:500, color:'#1e293b' }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [monthly, setMonthly]     = useState([])
  const [weekly, setWeekly]       = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [months, setMonths]       = useState('12')
  const [catType, setCatType]     = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      dashboardApi.monthlyTrends({ months }),
      dashboardApi.weeklyTrends({ weeks: 8 }),
      dashboardApi.categories({ type: catType || undefined }),
    ]).then(([m, w, c]) => {
      setMonthly(m.data.data.map(d => ({ ...d, month: formatMonth(d.month) })))
      setWeekly(w.data.data.map(d => ({ ...d, week: d.week?.slice(-3) || d.week })))
      setCategories(c.data.data)
    }).catch(err => setError(getErrorMessage(err)))
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [months, catType])

  const incomeData  = categories.filter(c => c.type === 'income')
  const expenseData = categories.filter(c => c.type === 'expense')

  if (loading) return <PageLoader />

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:600, color:'#0f172a', margin:0 }}>Analytics</h1>
          <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.25rem' }}>Trends and breakdowns across time</p>
        </div>
        <select value={months} onChange={e => setMonths(e.target.value)}
          style={{ border:'1px solid #e2e8f0', borderRadius:'0.75rem', padding:'0.5rem 0.75rem', fontSize:'0.875rem', color:'#334155', background:'#fff', cursor:'pointer' }}>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
        </select>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Monthly bar chart */}
      <div style={card}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e293b', margin:'0 0 0.25rem' }}>Monthly Income vs Expenses</h2>
        <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'0 0 1.25rem' }}>Side by side comparison</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} />
            <Legend wrapperStyle={{ fontSize:12, paddingTop:12 }} />
            <Bar dataKey="income"  fill="#059669" radius={[4,4,0,0]} maxBarSize={40} />
            <Bar dataKey="expense" fill="#e11d48" radius={[4,4,0,0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net balance line chart */}
      <div style={card}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e293b', margin:'0 0 0.25rem' }}>Net Balance Trend</h2>
        <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'0 0 1.25rem' }}>Monthly net (income − expenses)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="net" stroke="#4f46e5" strokeWidth={2.5} dot={{ r:4, fill:'#4f46e5' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly area */}
      <div style={card}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e293b', margin:'0 0 0.25rem' }}>Weekly Activity</h2>
        <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'0 0 1.25rem' }}>Last 8 weeks</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekly}>
            <defs>
              <linearGradient id="wI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient>
              <linearGradient id="wE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/><stop offset="95%" stopColor="#e11d48" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="income"  stroke="#059669" strokeWidth={2} fill="url(#wI)" />
            <Area type="monotone" dataKey="expense" stroke="#e11d48" strokeWidth={2} fill="url(#wE)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e293b', margin:0 }}>Category Breakdown</h2>
        <select value={catType} onChange={e => setCatType(e.target.value)}
          style={{ border:'1px solid #e2e8f0', borderRadius:'0.75rem', padding:'0.5rem 0.75rem', fontSize:'0.875rem', color:'#334155', background:'#fff' }}>
          <option value="">All types</option>
          <option value="income">Income only</option>
          <option value="expense">Expense only</option>
        </select>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {[{ label:'Income by Category', data: incomeData }, { label:'Expenses by Category', data: expenseData }]
          .filter(g => !catType || (catType==='income' ? g.data===incomeData : g.data===expenseData))
          .map(({ label, data }) => (
          <div key={label} style={{ ...card, marginBottom:0 }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:600, color:'#1e293b', margin:'0 0 1.25rem' }}>{label}</h3>
            {data.length === 0
              ? <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:'0.875rem' }}>No data</div>
              : <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
                  <div style={{ flexShrink:0 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={data} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                          {data.map(e => <Cell key={e.category} fill={CATEGORY_COLORS[e.category] || '#94a3b8'} />)}
                        </Pie>
                        <Tooltip formatter={v => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {data.slice(0,6).map(d => (
                      <div key={d.category} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <span style={{ width:10, height:10, borderRadius:'2px', flexShrink:0, background: CATEGORY_COLORS[d.category] || '#94a3b8' }} />
                        <span style={{ fontSize:'0.75rem', color:'#475569', textTransform:'capitalize', flex:1 }}>{d.category}</span>
                        <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#1e293b' }}>{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
            }
          </div>
        ))}
      </div>
    </div>
  )
}