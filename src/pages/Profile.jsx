import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    readingCount: 0,
    favoritesCount: 0,
    totalChapters: 0
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (user) {
      // Load stats from localStorage
      const history = JSON.parse(localStorage.getItem('mangexis_reading_history') || '[]')
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      
      setStats({
        readingCount: history.length,
        favoritesCount: favorites.length,
        totalChapters: history.length
      })
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="pt-20 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-2">
            Profilim
          </h1>
          <p className="text-gray-400">Hesap bilgilerin ve istatistiklerin</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.username}
                </h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <p className="text-gray-500 text-xs mt-1">
                  📅 Üyelik: {memberSince}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🚪 Çıkış Yap
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {stats.readingCount}
              </div>
              <div className="text-gray-400 text-sm">Okunan Bölüm</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.favoritesCount}
              </div>
              <div className="text-gray-400 text-sm">Favori Manga</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-gray-400 text-sm">Gün</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          <button
            onClick={() => navigate('/history')}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 text-left transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Okuma Geçmişi</h3>
                <p className="text-gray-400 text-sm">Okuduğun mangaları gör</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 text-left transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Favorilerim</h3>
                <p className="text-gray-400 text-sm">Favori mangalarını keşfet</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>Hesap Ayarları</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Kullanıcı Adı</span>
                <span className="text-white">{user.username}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Hesap Türü</span>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Premium
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="text-white font-semibold">Premium Üyelik</h3>
                <p className="text-gray-400 text-sm">Tüm özelliklere sınırsız erişim</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Sınırsız manga okuma</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Okuma geçmişi senkronizasyonu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Favori manga listesi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Reklamsız deneyim</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
