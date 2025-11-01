import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFavorites } from '../hooks/useFavorites'
import { useUser } from '@clerk/clerk-react'
import { getAllMangas } from '../utils/mangaService'
import MangaCard from '../components/MangaCard'

const Favorites = () => {
  const { favorites: favoriteSlugs, migrateFavorites, isSignedIn } = useFavorites()
  const { user } = useUser()
  const [favoriteMangas, setFavoriteMangas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Migrate localStorage favorites on first load
    if (isSignedIn) {
      migrateFavorites()
    }
  }, [isSignedIn])

  useEffect(() => {
    loadFavoriteMangas()
  }, [favoriteSlugs])

  const loadFavoriteMangas = async () => {
    try {
      setLoading(true)
      const allMangas = await getAllMangas()
      const filtered = allMangas.filter(manga => favoriteSlugs.includes(manga.slug))
      setFavoriteMangas(filtered)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Favorilerim</h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-white to-transparent rounded-full mb-4"></div>
          <p className="text-gray-400">
            {favoriteMangas.length > 0 
              ? `${favoriteMangas.length} manga favorilerinizde` 
              : isSignedIn 
                ? 'Henüz favori manganız yok' 
                : 'Favorileri görüntülemek için giriş yapın'}
          </p>
          {isSignedIn && user && (
            <p className="text-purple-400 text-sm mt-2">
              ✨ {user.username || user.firstName || 'Kullanıcı'} olarak giriş yaptınız
            </p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : favoriteMangas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteMangas.map((manga, index) => (
              <motion.div
                key={manga.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MangaCard manga={manga} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {isSignedIn ? 'Favori manga bulunamadı' : 'Giriş Yapın'}
            </h2>
            <p className="text-gray-400 mb-8">
              {isSignedIn 
                ? 'Manga kartlarındaki ❤️ ikonuna tıklayarak favorilere ekleyin' 
                : 'Favorilerinizi görmek ve cihazlar arası senkronize etmek için giriş yapın'}
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all"
              >
                Mangaları Keşfet
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Favorites
