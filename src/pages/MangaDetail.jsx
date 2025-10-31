import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import Giscus from '../components/Giscus'

const MangaDetail = () => {
  const { slug } = useParams()
  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc')
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    loadManga()
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

  const handleShare = async () => {
    const shareData = {
      title: manga.title,
      text: `${manga.title} - MangeXis'te okuyun!`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link kopyalandı!')
      }
    } catch (error) {
      console.error('Share failed:', error)
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
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!manga) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-xl">Manga bulunamadı</p>
      </div>
    )
  }

  const sortedChapters = [...manga.chapters].sort((a, b) => {
    return sortOrder === 'desc' 
      ? parseInt(b.id) - parseInt(a.id)
      : parseInt(a.id) - parseInt(b.id)
  })

  return (
    <div className="pt-16 min-h-screen">
      {/* Epic Hero Section with Parallax */}
      <motion.div 
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 -z-20">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ 
              backgroundImage: `url(${manga.cover})`,
              filter: 'blur(80px) brightness(0.3)'
            }}
            animate={{
              scale: [1.1, 1.15, 1.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 3D Cover Image */}
            <motion.div 
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <motion.div
                whileHover={{ 
                  rotateY: 5,
                  rotateX: 5,
                  scale: 1.02
                }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative group perspective-1000"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                
                {/* Main Cover */}
                <div className="relative">
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-full h-auto rounded-2xl shadow-2xl border-2 border-white/10 relative z-10"
                  />
                  
                  {/* Overlay Stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl z-20 flex items-end p-6">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-lg px-3 py-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="font-bold">{manga.chapters.length}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-lg px-3 py-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="font-bold">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Manga Info - Ultra Modern */}
            <div className="lg:col-span-7">
              {/* Title with Gradient */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white animate-gradient">
                  {manga.title}
                </span>
              </motion.h1>

              {/* Status Badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 mb-6"
              >
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`px-6 py-3 text-sm font-black rounded-full ${
                    manga.status === 'ongoing'
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg shadow-green-500/50'
                      : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
                  }`}
                >
                  {manga.status === 'ongoing' ? '● DEVAM EDİYOR' : '■ TAMAMLANDI'}
                </motion.span>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
                >
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-white font-bold">{manga.chapters.length} Bölüm</span>
                </motion.div>
              </motion.div>

              {/* Genres Pills */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre, index) => (
                    <motion.span
                      key={genre}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/30 rounded-full text-sm font-bold hover:from-white/30 hover:to-white/20 transition-all cursor-pointer"
                    >
                      {genre}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-8"
              >
                <p className="text-lg text-gray-300 leading-relaxed line-clamp-4">
                  {manga.description}
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                {manga.chapters.length > 0 && (
                  <Link to={`/manga/${manga.slug}/chapter/${manga.chapters[0].id}`} className="flex-1 min-w-[200px]">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-8 py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-2xl"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      OKUMAYA BAŞLA
                    </motion.button>
                  </Link>
                )}
                
                <motion.button
                  onClick={toggleFavorite}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-5 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                    isFavorite 
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50' 
                      : 'bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-5 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📚', label: 'Bölümler', value: manga.chapters.length, color: 'from-purple-500 to-purple-700' },
            { icon: '⭐', label: 'Puan', value: '4.8', color: 'from-yellow-500 to-orange-600' },
            { icon: '👁️', label: 'Görüntüleme', value: '12.5K', color: 'from-blue-500 to-cyan-600' },
            { icon: '❤️', label: 'Favori', value: '2.1K', color: 'from-red-500 to-pink-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-center overflow-hidden group cursor-pointer`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-white/80">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chapter List - Ultra Modern Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Bölümler</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-white to-transparent rounded-full" />
            </div>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white font-bold cursor-pointer hover:bg-white/20 transition-all"
            >
              <option value="desc">En Yeni</option>
              <option value="asc">En Eski</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedChapters.map((chapter, index) => (
              <Link
                key={chapter.id}
                to={`/manga/${manga.slug}/chapter/${chapter.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:from-white/20 hover:to-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all flex-1 pr-2">
                        {chapter.title}
                      </h3>
                      <motion.svg 
                        className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400 group-hover:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">{chapter.imageLinks.length} sayfa</span>
                      </div>
                    </div>
                  </div>

                  {/* New Badge */}
                  {index < 3 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-black text-xs font-black rounded-full shadow-lg"
                    >
                      NEW
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Comments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-6">
            <h2 className="text-4xl font-black text-white mb-2">Yorumlar</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-white to-transparent rounded-full" />
          </div>
          <Giscus 
            term={manga.title}
            category="Manga"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default MangaDetail
