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
        <p className="text-[#BFBFBF] text-lg">Manga bulunamadı</p>
      </div>
    )
  }

  const firstChapter = manga.chapters[0]
  const lastChapter = manga.chapters[manga.chapters.length - 1]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px'
        }}
      />

      {/* Desktop/Mobile Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          </Link>
          
          <motion.button
            onClick={toggleFavorite}
            whileTap={{ scale: 0.95 }}
            className="p-2 -mr-2 text-white hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Hero Banner - Full Width (if exists) */}
      {manga.heroBanner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-48 md:h-64 overflow-hidden"
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
        </motion.div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Desktop: 2-Column Layout | Mobile: Single Column */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr] gap-8 lg:gap-14">
          
          {/* LEFT COLUMN: Cover Image (Desktop) | Top Section (Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center lg:items-start"
          >
            <div className="relative w-full max-w-[280px] md:max-w-[320px] lg:max-w-none">
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full h-auto rounded-md shadow-2xl"
                style={{ 
                  filter: 'grayscale(100%) contrast(1.05)',
                  boxShadow: '0 20px 60px rgba(255, 255, 255, 0.08), 0 8px 16px rgba(0, 0, 0, 0.6)'
                }}
              />
            </div>

            {/* Mobile: Show Buttons Here (Below Cover) */}
            <div className="lg:hidden w-full max-w-[280px] md:max-w-[320px] mt-6 space-y-3">
              {firstChapter && (
                <Link to={`/manga/${manga.slug}/chapter/${firstChapter.id}`} className="block">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 bg-white text-black rounded-md font-semibold text-sm hover:bg-[#D9D9D9] transition-all duration-150"
                  >
                    İlk Bölüm
                  </motion.button>
                </Link>
              )}
              
              {lastChapter && (
                <Link to={`/manga/${manga.slug}/chapter/${lastChapter.id}`} className="block">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 bg-transparent border border-white/35 text-white rounded-md font-semibold text-sm hover:border-white/50 hover:bg-white/5 transition-all duration-150"
                  >
                    Son Bölüm
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col max-w-[600px] mx-auto lg:mx-0 lg:max-w-none"
          >
            {/* Title */}
            <h1 
              className="text-2xl md:text-3xl lg:text-[32px] font-bold text-white leading-tight tracking-tight text-center lg:text-left"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Roboto", sans-serif' }}
            >
              {manga.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-3 text-sm md:text-base text-[#BFBFBF]">
              <span>{manga.chapters.length} Bölüm</span>
              <span className="w-1 h-1 bg-[#BFBFBF] rounded-full" />
              <span className="capitalize">{manga.status === 'ongoing' ? 'Devam Ediyor' : manga.status === 'completed' ? 'Tamamlandı' : 'Ara Verildi'}</span>
              {manga.fansub && (
                <>
                  <span className="w-1 h-1 bg-[#BFBFBF] rounded-full" />
                  <span>{manga.fansub}</span>
                </>
              )}
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-6">
              {manga.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 md:px-4 py-1.5 border border-white/30 rounded-full text-xs md:text-[13px] text-white hover:border-white/50 transition-all duration-150"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mt-6">
              <p 
                className={`text-sm md:text-base text-[#D9D9D9] leading-relaxed text-justify ${!showFullDescription ? 'line-clamp-[9]' : ''}`}
                style={{ lineHeight: '1.55' }}
              >
                {manga.description}
              </p>
              {manga.description.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-white text-sm md:text-base mt-3 hover:opacity-70 transition-opacity underline underline-offset-2"
                >
                  {showFullDescription ? 'Daha Az Göster' : 'Devamını Gör'}
                </button>
              )}
            </div>

            {/* Rating (Optional) */}
            <div className="flex items-center gap-2 mt-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-white text-sm md:text-base font-medium">4.8</span>
            </div>

            {/* Desktop: Action Buttons */}
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-8">
              {firstChapter && (
                <Link to={`/manga/${manga.slug}/chapter/${firstChapter.id}`}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 bg-white text-black rounded-md font-semibold text-sm hover:bg-[#D9D9D9] transition-all duration-150"
                  >
                    İlk Bölüm
                  </motion.button>
                </Link>
              )}
              
              {lastChapter && (
                <Link to={`/manga/${manga.slug}/chapter/${lastChapter.id}`}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 bg-transparent border border-white/35 text-white rounded-md font-semibold text-sm hover:border-white/50 hover:bg-white/5 transition-all duration-150"
                  >
                    Son Bölüm
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Episodes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-14 md:mt-18 lg:mt-22"
        >
          <h2 
            className="text-lg md:text-xl lg:text-[22px] font-semibold text-white mb-6 text-center lg:text-left"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Bölümler
          </h2>
          
          {/* Desktop: Multi-column grid | Mobile: Single column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {manga.chapters.map((chapter, index) => (
              <Link
                key={chapter.id}
                to={`/manga/${manga.slug}/chapter/${chapter.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.02, duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative h-[54px] md:h-[56px] border border-white/22 rounded-md flex items-center justify-center hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-150 bg-black/40"
                >
                  <span className="text-white text-sm md:text-base font-medium">
                    {chapter.title}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-14 md:mt-18 lg:mt-22"
        >
          <h2 
            className="text-lg md:text-xl lg:text-[22px] font-semibold text-white mb-6 text-center lg:text-left"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Yorumlar
          </h2>
          <div className="border border-white/15 rounded-md p-4 md:p-6 bg-white/[0.02]">
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
