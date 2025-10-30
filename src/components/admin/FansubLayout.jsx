import { useState, useEffect } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../utils/adminApi'

const FansubLayout = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authApi.getToken()
      
      if (!token) {
        navigate('/admin/login')
        return
      }

      try {
        const result = await authApi.verify(token)
        
        if (result.success) {
          if (result.user.role !== 'fansub') {
            // If not fansub, redirect to admin
            navigate('/admin/dashboard')
            return
          }
          setUser(result.user)
        } else {
          authApi.removeToken()
          alert('⚠️ Oturumunuz sona erdi. Lütfen tekrar giriş yapın.')
          navigate('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        authApi.removeToken()
        navigate('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    authApi.removeToken()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">MangeXis Fansub</h1>
                  <p className="text-purple-300 text-xs">Bölüm Yönetim Paneli</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-900 font-bold text-sm">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{user?.username}</p>
                  <p className="text-purple-300 text-xs">Fansub</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Çıkış</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Link
            to="/fansub"
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              useLocation().pathname === '/fansub' || useLocation().pathname === '/fansub/chapter-add'
                ? 'bg-white text-purple-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📖 Bölüm Ekle
          </Link>
          <Link
            to="/fansub/manga/new"
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              useLocation().pathname === '/fansub/manga/new'
                ? 'bg-white text-purple-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ➕ Manga Ekle
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
        <p className="text-white/60 text-sm">
          © 2025 MangeXis Fansub Panel - Manga bölümlerini yönetin
        </p>
      </footer>
    </div>
  )
}

export default FansubLayout
