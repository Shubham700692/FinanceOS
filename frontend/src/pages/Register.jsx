import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react'
import { authApi } from '../api'
import { Alert, Spinner } from '../components/ui'
import { getErrorMessage } from '../utils'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ name:'', email:'', password:'', role:'viewer' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await authApi.register(form); navigate('/login') }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #1e1b4b 0%, #1e293b 60%, #0f172a 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', marginBottom:'2rem' }}>
          <div style={{ padding:'0.75rem', background:'#4f46e5', borderRadius:'1rem', boxShadow:'0 0 24px rgb(99 102 241/.5)', display:'flex' }}>
            <Wallet size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff', margin:0 }}>FinanceOS</h1>
            <p style={{ fontSize:'0.75rem', color:'#64748b', margin:0 }}>Create your account</p>
          </div>
        </div>
        <div style={{ background:'#fff', borderRadius:'1.25rem', boxShadow:'0 20px 60px rgb(0 0 0/.3)', padding:'2rem' }}>
          <h2 style={{ fontSize:'1.125rem', fontWeight:600, color:'#0f172a', margin:'0 0 0.25rem' }}>Get started</h2>
          <p style={{ fontSize:'0.875rem', color:'#94a3b8', margin:'0 0 1.5rem' }}>Fill in your details below</p>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="label">Full name</label><input className="input" required placeholder="John Doe" value={form.name} onChange={set('name')} /></div>
            <div><label className="label">Email address</label><input type="email" className="input" required placeholder="you@example.com" value={form.email} onChange={set('email')} /></div>
            <div>
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} className="input" required placeholder="Min 8 chars, upper + lower + number"
                  style={{ paddingRight:'2.5rem' }} value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPass(s=>!s)}
                  style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
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
            <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', marginTop:'0.5rem' }}>
              {loading ? <Spinner size="sm" /> : <><span>Create account</span><ArrowRight size={16} /></>}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:'0.75rem', color:'#94a3b8', marginTop:'1rem' }}>
            Already have an account? <Link to="/login" style={{ color:'#4f46e5', fontWeight:500, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}