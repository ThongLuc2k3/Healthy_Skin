import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, getToken, setToken } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    apiClient
      .get('/auth/me', { auth: true })
      .then(setUser)
      .catch(() => {
        setToken(null)
        setSessionExpired(true)
      })
      .finally(() => setReady(true))
  }, [])

  async function register(email, password) {
    const data = await apiClient.post('/auth/register', { email, password })
    setToken(data.token)
    setUser(data.user)
    setSessionExpired(false)
    return data.user
  }

  async function login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    setSessionExpired(false)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
    setSessionExpired(false)
  }

  return (
    <AuthContext.Provider value={{ user, ready, sessionExpired, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return ctx
}
