import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../utils/adminApi'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [sessionRemaining, setSessionRemaining] = useState(null)

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
          setUser(result.user)
          if (result.sessionRemaining) {
            setSessionRemaining(result.sessionRemaining)
          }
        } else {
          authApi.removeToken()
          alert('⚖️ Oturumunuz sona erdi. Lütfen tekrar giriş yapın.')
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

    // Session timeout monitoring - check every minute
    const sessionCheck = setInterval(async () => {
      const token = authApi.getToken()
      if (!token) {
        clearInterval(sessionCheck)
        return
      }

      try {
        const result = await authApi.verify(token)
        if (!result.success) {
          clearInterval(sessionCheck)
          authApi.removeToken()
          alert('🕒 Oturumunuz sona erdi. Güvenlik nedeniyle otomatik olarak çıkış yapıldı.')
          navigate('/admin/login')
        } else if (result.sessionRemaining) {
          setSessionRemaining(result.sessionRemaining)
          // Warn when 10 minutes remaining
          if (result.sessionRemaining < 10 * 60 * 1000 && result.sessionRemaining > 9 * 60 * 1000) {
            alert('⚠️ Oturumunuz 10 dakika içinde sona erecek. Yapılan değişiklikleri kaydedin.')
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(sessionCheck)
  }, [navigate])

  const handleLogout = () => {
    authApi.removeToken()
    navigate('/admin/login')
  }

  const getMenuItems = () => {
    // Fansub role: only chapter add page
    if (user?.role === 'fansub') {
      return [
        { 
          name: 'Bölüm Ekle', 
          path: '/admin/chapter-add', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        }
      ]
    }
    
    // Admin role: all menu items
    return [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Slider Yönetimi', 
      path: '/admin/sliders', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      )
    },
    { 
      name: 'Mangalar', 
      path: '/admin/mangas', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      name: 'Haberler & Duyurular', 
      path: '/admin/news', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    { 
      name: 'Sayfa Yönetimi', 
      path: '/admin/pages', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ]
  }
  
  const menuItems = getMenuItems()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:relative w-64 h-screen bg-black border-r border-gray-800 z-50"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white">MangeXis</h1>
                <p className="text-gray-500 text-xs tracking-widest mt-1 font-semibold">ADMIN PANEL</p>
              </div>

              {/* Menu */}
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-white text-black font-semibold'
                          : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </nav>

              {/* User Info */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {user?.username || 'Admin'}
                    </p>
                    <p className="text-gray-500 text-xs">{user?.role || 'Yönetici'}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-black border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white p-2 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
              <h2 className="text-xl font-semibold text-white">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}
    </div>
  )
}

export default AdminLayout
