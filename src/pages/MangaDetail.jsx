import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import Comments from '../components/Comments'

const MangaDetail = () => {
  const { slug } = useParams()
  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadManga()
  }, [slug])

  const loadManga = async () => {
    setLoading(true)
    try {
      const apiMangas = await getAllMangas()
      const combined = [...mangaList, ...apiMangas]
      const found = combined.find(m => m.slug === slug)
      setManga(found)
    } catch (error) {
      console.error('Error loading manga:', error)
      setManga(mangaList.find(m => m.slug === slug))
    } finally {
      setLoading(false)
    }
  }

  if (!manga) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-tertiary text-xl">Manga bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section with Background */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-96 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12"
          >
            {/* Cover Image */}
            <div className="lg:col-span-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-10" />
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="w-full h-auto rounded-xl shadow-2xl border border-white/10"
                />
                {/* Quick Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{manga.chapters.length} Bölüm</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Manga Info */}
            <div className="lg:col-span-8">
              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              >
                {manga.title}
              </motion.h1>

              {/* Status & Stats */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 mb-6"
              >
                <span className={`px-4 py-2 text-sm font-bold rounded-lg ${
                  manga.status === 'ongoing'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-700 text-white'
                }`}>
                  {manga.status === 'ongoing' ? 'DEVAM EDİYOR' : 'BİTTİ'}
                </span>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm text-gray-300">{manga.chapters.length} Bölüm</span>
                </div>
              </motion.div>

              {/* Genres */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6"
              >
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Türler</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre) => (
                    <motion.span
                      key={genre}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer"
                    >
                      {genre}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Açıklama</h3>
                <p className="text-base text-gray-300 leading-relaxed">
                  {manga.description}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                {manga.chapters.length > 0 && (
                  <Link to={`/manga/${manga.slug}/chapter/${manga.chapters[0].id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      İlk Bölümü Oku
                    </motion.button>
                  </Link>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Listeye Ekle
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chapter List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Bölümler</h2>
              <div className="w-20 h-1 bg-white rounded-full"></div>
            </div>
            <div className="text-sm text-gray-400">
              {manga.chapters.length} bölüm mevcut
            </div>
          </div>

          {/* Chapter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {manga.chapters.map((chapter, index) => (
              <Link
                key={chapter.id}
                to={`/manga/${manga.slug}/chapter/${chapter.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                        {chapter.title}
                      </h3>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{chapter.imageLinks.length} sayfa</span>
                      </div>
                    </div>
                  </div>

                  {/* New Badge */}
                  {index < 3 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-black text-xs font-bold rounded">
                      YENİ
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Comments Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Comments 
            identifier={`manga-${manga.slug}`}
            title={manga.title}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default MangaDetail
