import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const API_BASE = '/.netlify/functions/user-auth'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('user_token')
    if (storedToken) {
      verifyToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setToken(tokenToVerify)
        localStorage.setItem('user_token', tokenToVerify)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, username) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('user_token', data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setToken(data.token)
        if (rememberMe) {
          localStorage.setItem('user_token', data.token)
        } else {
          sessionStorage.setItem('user_token', data.token)
        }
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user_token')
    sessionStorage.removeItem('user_token')
  }

  const updateProfile = async (updates) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Güncelleme hatası' }
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
