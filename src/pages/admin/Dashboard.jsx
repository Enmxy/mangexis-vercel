import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ mangas: 0, chapters: 0, news: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin')
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
        navigate('/admin')
      }
    } catch (error) {
      console.error('Auth error:', error)
      navigate('/admin')
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/manga-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'GET_ALL_MANGAS' })
      })
      const data = await response.json()
      
      if (data.success && data.mangas) {
        const totalChapters = data.mangas.reduce((sum, manga) => 
          sum + (manga.chapters?.length || 0), 0
        )
        setStats({
          mangas: data.mangas.length,
          chapters: totalChapters,
          news: 0
        })
      }
    } catch (error) {
      console.error('Stats load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_role')
    navigate('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">
          Hoş Geldin, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user?.username}</span> 👋
        </h1>
        <p className="text-gray-400">
          {isAdmin ? 'Tüm sistemi yönetebilirsin' : 'Bölüm ekleyebilir ve mangaları yönetebilirsin'}
        </p>
      </div>

      <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-2xl p-6 text-white shadow-2xl border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📚</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold">
                +{Math.floor(Math.random() * 5) + 1} bu ay
              </div>
            </div>
            <div className="text-4xl font-black mb-1">{stats.mangas}</div>
            <div className="text-purple-100 font-medium">Toplam Manga</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-2xl border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📖</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold">
                +{Math.floor(Math.random() * 20) + 10} bu hafta
              </div>
            </div>
            <div className="text-4xl font-black mb-1">{stats.chapters}</div>
            <div className="text-blue-100 font-medium">Toplam Bölüm</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl p-6 text-white shadow-2xl border border-green-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📰</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold">
                Yakında
              </div>
            </div>
            <div className="text-4xl font-black mb-1">{stats.news}</div>
            <div className="text-green-100 font-medium">Toplam Haber</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <span>⚡</span> Hızlı İşlemler
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Common for both */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/chapter/add')}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white p-6 rounded-xl text-left transition-all shadow-lg hover:shadow-purple-500/30"
            >
              <div className="text-3xl mb-2">➕</div>
              <div className="font-bold">Bölüm Ekle</div>
              <div className="text-sm text-purple-200">Yeni bölüm yükle</div>
            </motion.button>

            {/* Admin only */}
            {isAdmin && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/manga/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-bold">Manga Ekle</div>
                  <div className="text-sm text-blue-200">Yeni manga oluştur</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/manga')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-bold">Manga Listesi</div>
                  <div className="text-sm text-indigo-200">Tüm mangaları yönet</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/news/add')}
                  className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <div className="text-3xl mb-2">📰</div>
                  <div className="font-bold">Haber Ekle</div>
                  <div className="text-sm text-green-200">Yeni haber yayınla</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/slider')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <div className="text-3xl mb-2">🎪</div>
                  <div className="font-bold">Slider Yönet</div>
                  <div className="text-sm text-yellow-200">Ana sayfa slider'ı</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/pages')}
                  className="bg-pink-600 hover:bg-pink-700 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <div className="text-3xl mb-2">📄</div>
                  <div className="font-bold">Özel Sayfalar</div>
                  <div className="text-sm text-pink-200">Sayfa yönetimi</div>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            🚀 Vercel Serverless Functions ile çalışıyor
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Repository: github.com/Enmxy/mangexis-vercel
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
