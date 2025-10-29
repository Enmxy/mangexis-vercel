import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Favorites = () => {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFavorites(saved)
  }

  const removeFavorite = (slug) => {
    const updated = favorites.filter(fav => fav.slug !== slug)
    localStorage.setItem('favorites', JSON.stringify(updated))
    setFavorites(updated)
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
            {favorites.length > 0 
              ? `${favorites.length} manga favorilerinizde` 
              : 'Henüz favori manganız yok'}
          </p>
        </motion.div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((manga, index) => (
              <motion.div
                key={manga.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group"
              >
                <Link to={`/manga/${manga.slug}`}>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300">
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className="w-full h-auto aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                        {manga.title}
                      </h3>
                      <p className="text-gray-300 text-xs">
                        {manga.chapters?.length || 0} bölüm
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFavorite(manga.slug)}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
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
            <h2 className="text-2xl font-bold text-white mb-4">Favori manga bulunamadı</h2>
            <p className="text-gray-400 mb-8">
              Manga detay sayfasından favorilere ekleyerek başlayın
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
