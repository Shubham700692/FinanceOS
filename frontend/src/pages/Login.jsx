import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Alert, Spinner } from '../components/ui'
import { getErrorMessage } from '../utils'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const demos = {
      admin:   { email: 'admin@financeos.dev',   password: 'Admin@123' },
      analyst: { email: 'analyst@financeos.dev', password: 'Analyst@123' },
      viewer:  { email: 'viewer@financeos.dev',  password: 'Viewer@123' },
    }
    setForm(demos[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-surface-900 to-surface-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-brand-600 rounded-2xl shadow-glow">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">FinanceOS</h1>
            <p className="text-xs text-surface-400">Finance Dashboard System</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-1">Welcome back</h2>
          <p className="text-sm text-surface-400 mb-6">Sign in to your account</p>

          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" className="input" required autoFocus
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10" required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Demo quick-fill */}
          <div className="mt-6 pt-5 border-t border-surface-100">
            <p className="text-xs text-surface-400 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'analyst', 'viewer'].map(role => (
                <button
                  key={role}
                  type="button"
                  className="btn-secondary btn-sm capitalize"
                  onClick={() => fillDemo(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-surface-400 mt-4">
            No account?{' '}
            <Link to="/register" className="text-brand-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}