import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'

const Sidebar = ({ userRole = 'admin' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isAdmin = userRole === 'admin'

  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: isAdmin ? '/admin/dashboard' : '/fansub',
      roles: ['admin', 'fansub']
    },
    {
      icon: '📚',
      label: 'Manga Listesi',
      path: isAdmin ? '/admin/mangas' : '/fansub/manga-list',
      roles: ['admin']
    },
    {
      icon: '➕',
      label: 'Manga Ekle',
      path: isAdmin ? '/admin/mangas/new' : '/fansub/manga/new',
      roles: ['admin', 'fansub']
    },
    {
      icon: '📖',
      label: 'Bölüm Ekle',
      path: isAdmin ? '/admin/chapter-add' : '/fansub/chapter-add',
      roles: ['admin', 'fansub']
    },
    {
      icon: '📰',
      label: 'Haberler',
      path: '/admin/news',
      roles: ['admin']
    },
    {
      icon: '🎪',
      label: 'Slider',
      path: '/admin/sliders',
      roles: ['admin']
    },
    {
      icon: '📄',
      label: 'Özel Sayfalar',
      path: '/admin/pages',
      roles: ['admin']
    }
  ]

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_role')
    navigate('/admin/login')
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: collapsed ? '80px' : '280px' }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800 z-40 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">MangeXis</h1>
                <p className="text-purple-400 text-xs capitalize">{userRole} Panel</p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== (isAdmin ? '/admin/dashboard' : '/fansub') && location.pathname.startsWith(item.path))
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all"
        >
          <span className="text-2xl">🚪</span>
          {!collapsed && <span className="font-medium">Çıkış Yap</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
