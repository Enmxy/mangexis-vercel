import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import { startAutoRefresh, stopAutoRefresh } from '../utils/autoRefresh'
import Giscus from '../components/Giscus'

const MangaDetail = () => {
  const { slug } = useParams()
  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    loadManga()
    
    startAutoRefresh(async () => {
      await loadManga()
    })
    
    return () => {
      stopAutoRefresh()
    }
  }, [slug])

  useEffect(() => {
    if (manga) {
      checkFavorite()
    }
  }, [manga])

  const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.some(fav => fav.slug === manga.slug))
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    if (isFavorite) {
      const updated = favorites.filter(fav => fav.slug !== manga.slug)
      localStorage.setItem('favorites', JSON.stringify(updated))
      setIsFavorite(false)
    } else {
      favorites.push({
        slug: manga.slug,
        title: manga.title,
        cover: manga.cover,
        genres: manga.genres,
        status: manga.status,
        chapters: manga.chapters
      })
      localStorage.setItem('favorites', JSON.stringify(favorites))
      setIsFavorite(true)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 text-lg">Manga bulunamadı</p>
      </div>
    )
  }

  const firstChapter = manga.chapters[0]
  const lastChapter = manga.chapters[manga.chapters.length - 1]

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 -ml-2"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          </Link>
          
          <motion.button
            onClick={toggleFavorite}
            whileTap={{ scale: 0.9 }}
            className="p-2 -mr-2"
          >
            <svg className="w-6 h-6 text-white" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Hero Banner */}
      {manga.heroBanner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-48 overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src={manga.heroBanner}
              alt={manga.title}
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.7)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-white text-xl font-bold drop-shadow-lg">{manga.title}</h2>
          </div>
        </motion.div>
      )}

      {/* Cover Section */}
      <div className="px-4 pt-3 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-[260px] mx-auto"
        >
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-auto rounded-lg shadow-2xl grayscale"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }}
          />
        </motion.div>
      </div>

      {/* Title & Meta */}
      <div className="px-4 pb-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white text-center mb-2 leading-tight"
        >
          {manga.title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-[#BFBFBF] text-center mb-3"
        >
          {manga.chapters.length} Bölüm
        </motion.p>

        {/* Genre Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center mb-4"
        >
          {manga.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 border border-white/30 rounded-full text-xs text-white"
            >
              {genre}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="px-4 pb-5"
      >
        <p className={`text-sm text-[#D9D9D9] leading-relaxed ${!showFullDescription ? 'line-clamp-5' : ''}`}>
          {manga.description}
        </p>
        {manga.description.length > 200 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-white text-sm mt-2 underline"
          >
            {showFullDescription ? 'Daha Az Göster' : 'Devamını Gör'}
          </button>
        )}
      </motion.div>

      {/* Rating */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4 pb-3 flex items-center gap-2"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <span className="text-white text-sm font-medium">4.8</span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="px-4 pb-6 space-y-3"
      >
        {firstChapter && (
          <Link to={`/manga/${manga.slug}/chapter/${firstChapter.id}`}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 bg-white text-black rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              İlk Bölüm
            </motion.button>
          </Link>
        )}
        
        {lastChapter && (
          <Link to={`/manga/${manga.slug}/chapter/${lastChapter.id}`}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 bg-transparent border border-white text-white rounded-md font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Son Bölüm
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* Divider */}
      <div className="px-4 pb-4">
        <div className="h-px bg-white/20" />
      </div>

      {/* Episodes Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 pb-8"
      >
        <h2 className="text-lg font-bold text-white mb-4">Bölümler</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {manga.chapters.map((chapter, index) => (
            <Link
              key={chapter.id}
              to={`/manga/${manga.slug}/chapter/${chapter.id}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-12 border border-white/30 rounded-md flex items-center justify-center hover:bg-white/5 hover:shadow-lg transition-all"
              >
                <span className="text-white text-sm font-medium">
                  {chapter.title}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="px-4 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Yorumlar</h2>
          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
            <Giscus 
              term={manga.title}
              category="Manga"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MangaDetail
