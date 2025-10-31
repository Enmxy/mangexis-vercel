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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">MangeXis</h1>
            <p className="text-purple-400 text-sm">
              {isAdmin ? 'Admin Panel' : 'Fansub Panel'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-xl"
          >
            <div className="text-4xl mb-2">📚</div>
            <div className="text-3xl font-bold">{stats.mangas}</div>
            <div className="text-purple-200">Toplam Manga</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-xl"
          >
            <div className="text-4xl mb-2">📖</div>
            <div className="text-3xl font-bold">{stats.chapters}</div>
            <div className="text-blue-200">Toplam Bölüm</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-xl"
          >
            <div className="text-4xl mb-2">📰</div>
            <div className="text-3xl font-bold">{stats.news}</div>
            <div className="text-green-200">Toplam Haber</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Hızlı İşlemler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Common for both */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/chapter/add')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-left transition-colors"
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
