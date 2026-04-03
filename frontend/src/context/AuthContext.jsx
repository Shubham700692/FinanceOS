import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('accessToken',  data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    setUser(data.data.user)
    return data.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refreshToken')
      await authApi.logout(rt)
    } catch { /* ignore */ }
    localStorage.clear()
    setUser(null)
  }, [])

  const isAdmin   = user?.role === 'admin'
  const isAnalyst = user?.role === 'analyst' || user?.role === 'admin'
  const isViewer  = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAnalyst, isViewer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}