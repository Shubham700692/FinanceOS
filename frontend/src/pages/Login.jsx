// import { useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { Alert, Spinner } from '../components/ui'
// import { getErrorMessage } from '../utils'

// export default function Login() {
//   const { login } = useAuth()
//   const navigate = useNavigate()
//   const [form, setForm]       = useState({ email: '', password: '' })
//   const [showPass, setShowPass] = useState(false)
//   const [loading, setLoading]   = useState(false)
//   const [error, setError]       = useState('')

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)
//     try {
//       const user = await login(form.email, form.password)
//       navigate('/')
//     } catch (err) {
//       setError(getErrorMessage(err))
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fillDemo = (role) => {
//     const demos = {
//       admin:   { email: 'admin@financeos.dev',   password: 'Admin@123' },
//       analyst: { email: 'analyst@financeos.dev', password: 'Analyst@123' },
//       viewer:  { email: 'viewer@financeos.dev',  password: 'Viewer@123' },
//     }
//     setForm(demos[role])
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-brand-950 via-surface-900 to-surface-800 flex items-center justify-center p-4">
//       <div className="w-full max-w-md animate-slide-up">

//         {/* Logo */}
//         <div className="flex items-center justify-center gap-3 mb-8">
//           <div className="p-3 bg-brand-600 rounded-2xl shadow-glow">
//             <Wallet className="h-7 w-7 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">FinanceOS</h1>
//             <p className="text-xs text-surface-400">Finance Dashboard System</p>
//           </div>
//         </div>

        
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <h2 className="text-lg font-semibold text-surface-900 mb-1">Welcome back</h2>
//           <p className="text-sm text-surface-400 mb-6">Sign in to your account</p>

//           {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="label">Email address</label>
//               <input
//                 type="email" className="input" required autoFocus
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
//               />
//             </div>
//             <div>
//               <label className="label">Password</label>
//               <div className="relative">
//                 <input
//                   type={showPass ? 'text' : 'password'}
//                   className="input pr-10" required
//                   placeholder="••••••••"
//                   value={form.password}
//                   onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
//                   onClick={() => setShowPass(s => !s)}
//                 >
//                   {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn-primary w-full" disabled={loading}>
//               {loading ? <Spinner size="sm" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
//             </button>
//           </form>

      
//           <div className="mt-6 pt-5 border-t border-surface-100">
//             <p className="text-xs text-surface-400 text-center mb-3">Quick demo access</p>
//             <div className="grid grid-cols-3 gap-2">
//               {['admin', 'analyst', 'viewer'].map(role => (
//                 <button
//                   key={role}
//                   type="button"
//                   className="btn-secondary btn-sm capitalize"
//                   onClick={() => fillDemo(role)}
//                 >
//                   {role}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <p className="text-center text-xs text-surface-400 mt-4">
//             No account?{' '}
//             <Link to="/register" className="text-brand-600 hover:underline font-medium">
//               Create one
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Wallet, ArrowRight, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Alert, Spinner } from '../components/ui'
import { getErrorMessage } from '../utils'
import api from '../api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [waking, setWaking]     = useState(false)
  const [error, setError]       = useState('')
  const [wakingDot, setWakingDot] = useState(0)

  // Animate dots while waking
  useEffect(() => {
    if (!waking) return
    const t = setInterval(() => setWakingDot(d => (d + 1) % 4), 400)
    return () => clearInterval(t)
  }, [waking])

  // Ping backend on mount to pre-warm it
  useEffect(() => {
    api.get('/health').catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Show "waking up" message after 4 seconds
    const wakingTimer = setTimeout(() => setWaking(true), 4000)

    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      const msg = getErrorMessage(err)
      if (msg.includes('timeout') || msg.includes('Network')) {
        setError('Server is starting up. Please wait a moment and try again.')
      } else {
        setError(msg)
      }
    } finally {
      clearTimeout(wakingTimer)
      setLoading(false)
      setWaking(false)
    }
  }

  const fillDemo = (role) => {
    const d = {
      admin:   { email: 'admin@financeos.dev',   password: 'Admin@123'   },
      analyst: { email: 'analyst@financeos.dev', password: 'Analyst@123' },
      viewer:  { email: 'viewer@financeos.dev',  password: 'Viewer@123'  },
    }
    setForm(d[role])
  }

  const dots = '.'.repeat(wakingDot + 1)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 60%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.75rem', background: '#4f46e5', borderRadius: '1rem', boxShadow: '0 0 24px rgb(99 102 241 / 0.5)', display: 'flex' }}>
            <Wallet size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>FinanceOS</h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Finance Dashboard System</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 20px 60px rgb(0 0 0 / 0.3)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.25rem' }}>Welcome back</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 1.5rem' }}>Sign in to your account</p>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Waking up banner */}
          {waking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#1e40af' }}>
              <div style={{ animation: 'spin 1s linear infinite', display: 'flex' }}>
                <Loader size={14} />
              </div>
              <span>Server is waking up, please wait{dots} (first load ~30s)</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" required autoFocus placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="input" required placeholder="••••••••"
                  style={{ paddingRight: '2.5rem' }}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading
                ? <><Spinner size="sm" /><span style={{ marginLeft: 8 }}>{waking ? 'Waking server...' : 'Signing in...'}</span></>
                : <><span>Sign in</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Demo buttons */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '0.75rem' }}>Quick demo access</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['admin', 'analyst', 'viewer'].map(role => (
                <button key={role} type="button" className="btn-secondary btn-sm"
                  onClick={() => fillDemo(role)} style={{ textTransform: 'capitalize' }}>{role}</button>
              ))}
            </div>
          </div>

          {/* Render free tier notice */}
          <div style={{ marginTop: '1rem', padding: '0.625rem 0.875rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', fontSize: '0.7rem', color: '#78350f', textAlign: 'center' }}>
            ⚡ Hosted on Render free tier — first login may take up to 30 seconds
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
            No account? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}