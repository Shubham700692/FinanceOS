import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, BarChart2, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardApi } from '../api'
import { PageLoader, Alert } from '../components/ui'
import { formatCurrency, getErrorMessage, CATEGORY_COLORS } from '../utils'

const card = { background:'#fff', borderRadius:'1rem', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgb(0 0 0/.06)', padding:'1.5rem' }

export default function Insights() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    dashboardApi.insights()
      .then(r => setData(r.data.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const anomalies = data?.anomalies || []
  const topCats   = data?.top_categories || []
  const insights  = data?.spending_insights || []
  const chartData = insights.map(i => ({ category: i.category, avg: i.avg_monthly, current: i.current_month }))

  return (
    <div>
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:600, color:'#0f172a', margin:0 }}>Spending Insights</h1>
        <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginTop:'0.25rem' }}>AI-powered anomaly detection and spending patterns</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
            <Zap size={16} color="#d97706" />
            <h2 style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e293b', margin:0 }}>Spending Anomalies Detected</h2>
            <span style={{ background:'#fef3c7', color:'#78350f', fontSize:'0.7rem', fontWeight:600, padding:'0.15rem 0.5rem', borderRadius:'9999px' }}>{anomalies.length}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem' }}>
            {anomalies.map(a => (
              <div key={a.category} style={{ background:'#fffbeb', border:'1px solid #fde68a', borderLeft:'4px solid #f59e0b', borderRadius:'0.75rem', padding:'1rem' }}>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <AlertTriangle size={16} color="#d97706" style={{ flexShrink:0, marginTop:'2px' }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#1e293b', textTransform:'capitalize', margin:'0 0 0.25rem' }}>{a.category}</p>
                    <p style={{ fontSize:'0.75rem', color:'#475569', margin:'0 0 0.75rem' }}>
                      {a.deviation_percent > 0 ? `Spending is ${a.deviation_percent}% above your average` : `Spending is ${Math.abs(a.deviation_percent)}% below your average`}
                    </p>
                    <div style={{ display:'flex', gap:'1.5rem' }}>
                      <div>
                        <p style={{ fontSize:'0.65rem', color:'#94a3b8', margin:'0 0 0.125rem' }}>This month</p>
                        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#1e293b', fontFamily:'monospace', margin:0 }}>{formatCurrency(a.current_month)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize:'0.65rem', color:'#94a3b8', margin:'0 0 0.125rem' }}>Monthly avg</p>
                        <p style={{ fontSize:'0.875rem', fontWeight:500, color:'#64748b', fontFamily:'monospace', margin:0 }}>{formatCurrency(a.avg_monthly)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top cats + chart */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
        {/* Top categories */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
            <TrendingUp size={16} color="#4f46e5" />
            <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'#1e293b', margin:0 }}>Top Spending Categories</h2>
          </div>
          {topCats.length === 0
            ? <div style={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:'0.875rem' }}>No data yet</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                {topCats.map((c, i) => {
                  const max = topCats[0]?.current_month || 1
                  return (
                    <div key={c.category}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.375rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <span style={{ fontSize:'0.7rem', color:'#94a3b8', width:'1rem' }}>{i+1}</span>
                          <span style={{ fontSize:'0.8rem', fontWeight:500, color:'#334155', textTransform:'capitalize' }}>{c.category}</span>
                        </div>
                        <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#1e293b', fontFamily:'monospace' }}>{formatCurrency(c.current_month)}</span>
                      </div>
                      <div style={{ height:5, background:'#f1f5f9', borderRadius:9999, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(c.current_month/max)*100}%`, background: CATEGORY_COLORS[c.category]||'#4f46e5', borderRadius:9999, transition:'width 0.7s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </div>

        {/* Current vs avg chart */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
            <BarChart2 size={16} color="#4f46e5" />
            <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'#1e293b', margin:0 }}>Current vs 6-Month Average</h2>
          </div>
          {chartData.length === 0
            ? <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:'0.875rem' }}>No comparison data</div>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.slice(0,8)} layout="vertical" margin={{ top:0, right:10, left:70, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} width={68} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Bar dataKey="avg"     fill="#e2e8f0" radius={[0,4,4,0]} maxBarSize={10} name="6mo avg" />
                  <Bar dataKey="current" radius={[0,4,4,0]} maxBarSize={10} name="This month">
                    {chartData.slice(0,8).map(e => <Cell key={e.category} fill={CATEGORY_COLORS[e.category]||'#4f46e5'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Full table */}
      <div style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px rgb(0 0 0/.06)' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f1f5f9' }}>
          <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'#1e293b', margin:0 }}>Full Spending Breakdown</h2>
        </div>
        {insights.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'#94a3b8', fontSize:'0.875rem' }}>Add expense records to generate insights</div>
          : <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                  {['Category','This Month','6-Month Avg','Deviation','Status'].map(h => (
                    <th key={h} style={{ padding:'0.875rem 1.25rem', textAlign:'left', fontSize:'0.7rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insights.map(i => (
                  <tr key={i.category} style={{ borderBottom:'1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'0.875rem 1.25rem', fontWeight:500, textTransform:'capitalize', color:'#1e293b' }}>{i.category}</td>
                    <td style={{ padding:'0.875rem 1.25rem', fontFamily:'monospace', color:'#1e293b' }}>{formatCurrency(i.current_month)}</td>
                    <td style={{ padding:'0.875rem 1.25rem', fontFamily:'monospace', color:'#94a3b8' }}>{formatCurrency(i.avg_monthly)}</td>
                    <td style={{ padding:'0.875rem 1.25rem', fontWeight:500, color: i.deviation_percent > 0 ? '#e11d48' : '#059669' }}>
                      {i.deviation_percent > 0 ? '+' : ''}{i.deviation_percent}%
                    </td>
                    <td style={{ padding:'0.875rem 1.25rem' }}>
                      {i.anomaly
                        ? <span style={{ background:'#fef3c7', color:'#78350f', fontSize:'0.7rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'9999px', display:'inline-flex', alignItems:'center', gap:'0.25rem' }}><AlertTriangle size={10} /> Anomaly</span>
                        : <span style={{ background:'#f0fdf4', color:'#166534', fontSize:'0.7rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'9999px' }}>Normal</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  )
}