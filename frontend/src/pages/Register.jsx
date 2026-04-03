import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react'
import { authApi } from '../api'
import { Alert, Spinner } from '../components/ui'
import { getErrorMessage } from '../utils'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'viewer' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-surface-900 to-surface-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-brand-600 rounded-2xl shadow-glow">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">FinanceOS</h1>
            <p className="text-xs text-surface-400">Create your account</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-1">Get started</h2>
          <p className="text-sm text-surface-400 mb-6">Fill in your details below</p>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" required placeholder="John Doe" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10" required
                  placeholder="Min 8 chars, upper + lower + number"
                  value={form.password} onChange={set('password')}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="viewer">Viewer — read only</option>
                <option value="analyst">Analyst — read + create records</option>
                <option value="admin">Admin — full access</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-surface-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}