import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { authApi } from '../../utils/adminApi'
import Sidebar from './Sidebar'

const AdminLayout = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      navigate('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'verify' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setUser(result.user)
      } else {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_role')
        navigate('/admin/login')
      }
    } catch (error) {
      console.error('Auth error:', error)
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      <Sidebar userRole={user.role} />
      
      {/* Main Content */}
      <main className="flex-1 ml-[280px] p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
