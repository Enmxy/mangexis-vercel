import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const MobileBottomNav = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navItems = [
    {
      path: '/',
      label: 'Anasayfa',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/discover',
      label: 'Keşfet',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      path: '/history',
      label: 'Geçmiş',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: isAuthenticated ? '/profile' : '/login',
      label: isAuthenticated ? 'Profil' : 'Giriş',
      icon: (active) => (
        <svg className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                {item.icon(isActive)}
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
              
              <span className={`text-xs font-medium transition-colors ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
