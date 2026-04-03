import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Zap, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardApi } from '../api'
import { PageLoader, Alert, Empty } from '../components/ui'
import { formatCurrency, getErrorMessage, CATEGORY_COLORS } from '../utils'

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

  const chartData = insights.map(i => ({
    category: i.category,
    avg:     i.avg_monthly,
    current: i.current_month,
  }))

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Spending Insights</h1>
          <p className="page-subtitle">AI-powered anomaly detection and spending patterns</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

      {/* Anomaly alerts */}
      {anomalies.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold text-surface-800">Spending Anomalies Detected</h2>
            <span className="badge-warning">{anomalies.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.map(a => (
              <div key={a.category} className="card p-4 border-l-4 border-warning bg-warning-light/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-surface-800 capitalize">{a.category}</p>
                    <p className="text-xs text-surface-600 mt-0.5">
                      {a.deviation_percent > 0
                        ? `Spending is ${a.deviation_percent}% above your average`
                        : `Spending is ${Math.abs(a.deviation_percent)}% below your average`
                      }
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className="text-xs text-surface-400">This month</p>
                        <p className="text-sm font-semibold text-surface-800 font-mono">{formatCurrency(a.current_month)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-400">Monthly avg</p>
                        <p className="text-sm font-semibold text-surface-500 font-mono">{formatCurrency(a.avg_monthly)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top categories this month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-surface-800">Top Spending Categories</h2>
          </div>
          {topCats.length === 0 ? (
            <Empty title="No data" subtitle="Add expense records to see insights" icon={BarChart2} />
          ) : (
            <div className="space-y-3">
              {topCats.map((c, i) => {
                const maxVal = topCats[0]?.current_month || 1
                return (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-400 w-4">{i + 1}</span>
                        <span className="text-xs font-medium text-surface-700 capitalize">{c.category}</span>
                      </div>
                      <span className="text-xs font-semibold font-mono text-surface-800">{formatCurrency(c.current_month)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(c.current_month / maxVal) * 100}%`,
                          background: CATEGORY_COLORS[c.category] || '#6366f1'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Current vs average */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-surface-800">Current vs 6-Month Average</h2>
          </div>
          {chartData.length === 0 ? (
            <Empty title="No comparison data" subtitle="Need at least 2 months of data" icon={BarChart2} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={58} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="avg"     fill="#e4e8f0" radius={[0, 4, 4, 0]} maxBarSize={10} name="6mo avg" />
                <Bar dataKey="current" radius={[0, 4, 4, 0]} maxBarSize={10} name="This month">
                  {chartData.slice(0, 8).map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Full breakdown table */}
      <div className="table-wrapper">
        <div className="px-5 py-4 border-b border-surface-100">
          <h2 className="text-sm font-semibold text-surface-800">Full Spending Breakdown</h2>
        </div>
        {insights.length === 0 ? (
          <Empty title="No insights yet" subtitle="Add expense records to generate insights" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="text-right">This Month</th>
                <th className="text-right">6-Month Avg</th>
                <th className="text-right">Deviation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {insights.map(i => (
                <tr key={i.category}>
                  <td className="font-medium capitalize">{i.category}</td>
                  <td className="text-right font-mono text-sm">{formatCurrency(i.current_month)}</td>
                  <td className="text-right font-mono text-sm text-surface-400">{formatCurrency(i.avg_monthly)}</td>
                  <td className={`text-right font-medium text-sm ${i.deviation_percent > 0 ? 'text-expense' : 'text-income'}`}>
                    {i.deviation_percent > 0 ? '+' : ''}{i.deviation_percent}%
                  </td>
                  <td>
                    {i.anomaly
                      ? <span className="badge-warning"><AlertTriangle className="h-2.5 w-2.5" /> Anomaly</span>
                      : <span className="badge-income">Normal</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}