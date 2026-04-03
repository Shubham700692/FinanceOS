import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login    from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Records   from './pages/Records'
import Analytics from './pages/Analytics'
import Budgets   from './pages/Budgets'
import Insights  from './pages/Insights'
import Users     from './pages/Users'
import AuditLog  from './pages/AuditLog'
import { Spinner } from './components/ui'

const ROLE_LEVELS = { viewer: 1, analyst: 2, admin: 3 }

// Route guard — redirects to login if not authenticated, or to / if insufficient role
function Protected({ children, minRole = 'viewer' }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (ROLE_LEVELS[user.role] < ROLE_LEVELS[minRole]) return <Navigate to="/" replace />
  return children
}

// Redirect logged-in users away from auth pages
function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

      {/* Protected — inside layout */}
      <Route element={<Protected><Layout /></Protected>}>
        <Route index            element={<Dashboard />} />
        <Route path="records"   element={<Records />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="budgets"   element={<Budgets />} />
        <Route path="insights"  element={<Protected minRole="analyst"><Insights /></Protected>} />
        <Route path="users"     element={<Protected minRole="admin"><Users /></Protected>} />
        <Route path="audit"     element={<Protected minRole="admin"><AuditLog /></Protected>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}