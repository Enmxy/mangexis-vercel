const API_BASE = '/.netlify/functions'

// Auth API
export const authApi = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/admin-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    })
    return response.json()
  },

  verify: async (token) => {
    const response = await fetch(`${API_BASE}/admin-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'verify' })
    })
    return response.json()
  },

  getToken: () => localStorage.getItem('admin_token'),
  
  setToken: (token) => localStorage.setItem('admin_token', token),
  
  removeToken: () => localStorage.removeItem('admin_token'),
  
  isAuthenticated: async () => {
    const token = authApi.getToken()
    if (!token) return false
    
    const result = await authApi.verify(token)
    return result.success
  }
}

// Manga API
export const mangaApi = {
  getAll: async () => {
    const token = authApi.getToken()
    const response = await fetch(`${API_BASE}/admin-manga`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  add: async (manga) => {
    const token = authApi.getToken()
    const response = await fetch(`${API_BASE}/admin-manga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'add', manga })
    })
    return response.json()
  },

  update: async (manga) => {
    const token = authApi.getToken()
    const response = await fetch(`${API_BASE}/admin-manga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'update', manga })
    })
    return response.json()
  },

  delete: async (slug) => {
    const token = authApi.getToken()
    const response = await fetch(`${API_BASE}/admin-manga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'delete', manga: { slug } })
    })
    return response.json()
  }
}
