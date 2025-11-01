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
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-950/30 via-gray-900/50 to-transparent backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              Hoş Geldin, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 animate-pulse">{user?.username}</span> 👋
            </h1>
            <p className="text-gray-400 text-lg">
              {isAdmin ? '🚀 Tüm sistemi yönetebilirsin' : '📖 Bölüm ekleyebilir ve mangaları yönetebilirsin'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -8 }}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-600/10 via-purple-700/10 to-purple-800/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/30 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold text-purple-300">
                +{Math.floor(Math.random() * 5) + 1} bu ay
              </div>
            </div>
            <div className="text-5xl font-black text-white mb-2">{stats.mangas}</div>
            <div className="text-purple-300 font-semibold text-sm">Toplam Manga</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -8 }}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-blue-700/10 to-blue-800/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/30 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold text-blue-300">
                +{Math.floor(Math.random() * 20) + 10} bu hafta
              </div>
            </div>
            <div className="text-5xl font-black text-white mb-2">{stats.chapters}</div>
            <div className="text-blue-300 font-semibold text-sm">Toplam Bölüm</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -8 }}
          className="group relative overflow-hidden bg-gradient-to-br from-green-600/10 via-green-700/10 to-green-800/10 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 shadow-2xl hover:shadow-green-500/30 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold text-green-300">
                Yakında
              </div>
            </div>
            <div className="text-5xl font-black text-white mb-2">{stats.news}</div>
            <div className="text-green-300 font-semibold text-sm">Toplam Haber</div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-transparent backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Hızlı İşlemler</h2>
        </div>
          
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
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
      >
        <p className="text-gray-400 text-sm font-medium">
          🚀 Vercel Serverless Functions ile çalışıyor
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Repository: github.com/Enmxy/mangexis-vercel
        </p>
      </motion.div>
    </div>
  )
}

export default Dashboard
