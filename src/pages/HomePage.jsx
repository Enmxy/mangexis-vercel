import { useState, useEffect } from 'react'
import { startAutoRefresh, stopAutoRefresh } from '../utils/autoRefresh'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Slider from '../components/Slider'
import SearchFilter from '../components/SearchFilter'
import MangaCard from '../components/MangaCard'
import FeatureSection from '../components/FeatureSection'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import { getAllSliders } from '../utils/sliderService'
import { getReadingHistory } from '../utils/readingHistory'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [allMangas, setAllMangas] = useState(mangaList)
  const [filteredMangas, setFilteredMangas] = useState(mangaList)
  const [showIntro, setShowIntro] = useState(true)
  const [loading, setLoading] = useState(true)
  const [continueReading, setContinueReading] = useState([])
  const [recentlyUpdated, setRecentlyUpdated] = useState([])
  const [sliders, setSliders] = useState([])
  const [latestChapters, setLatestChapters] = useState([])

  // Load sliders and mangas from API
  useEffect(() => {
    loadSliders()
    loadAllMangas()
    
    // Auto refresh every 5 minutes
    startAutoRefresh(async () => {
      await loadAllMangas()
    }, 5)
    
    return () => {
      stopAutoRefresh()
    }
  }, [])

  const loadSliders = async () => {
    try {
      const data = await getAllSliders()
      setSliders(data)
    } catch (error) {
      console.error('Error loading sliders:', error)
      setSliders([])
    }
  }

  useEffect(() => {
    if (allMangas.length > 0) {
      loadContinueReading()
      // Get recently updated mangas (sort by latest chapter)
      const sorted = [...allMangas]
        .filter(m => m.chapters && m.chapters.length > 0)
        .sort((a, b) => {
          const aLatest = Math.max(...a.chapters.map(ch => parseInt(ch.id) || 0))
          const bLatest = Math.max(...b.chapters.map(ch => parseInt(ch.id) || 0))
          return bLatest - aLatest
        })
        .slice(0, 8)
      setRecentlyUpdated(sorted)
      
      // Get latest chapters from all mangas
      loadLatestChapters()
    }
  }, [allMangas])
  
  const loadLatestChapters = () => {
    try {
      const chapters = []
      
      allMangas.forEach(manga => {
        if (manga.chapters && manga.chapters.length > 0) {
          manga.chapters.forEach(chapter => {
            chapters.push({
              ...chapter,
              manga: {
                slug: manga.slug,
                title: manga.title,
                cover: manga.cover
              }
            })
          })
        }
      })
      
      // Sort by chapter ID (newest first) and take top 12
      const sorted = chapters
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 12)
      
      setLatestChapters(sorted)
    } catch (error) {
      console.error('Error loading latest chapters:', error)
    }
  }

  const loadAllMangas = async () => {
    setLoading(true)
    try {
      const apiMangas = await getAllMangas()
      const combined = [...mangaList, ...apiMangas]
      
      // Remove duplicates by slug
      const unique = combined.reduce((acc, manga) => {
        if (!acc.find(m => m.slug === manga.slug)) {
          acc.push(manga)
        }
        return acc
      }, [])
      
      setAllMangas(unique)
      setFilteredMangas(unique)
    } catch (error) {
      console.error('Error loading mangas:', error)
      setAllMangas(mangaList)
      setFilteredMangas(mangaList)
    } finally {
      setLoading(false)
    }
  }

  const loadContinueReading = () => {
    try {
      const history = getReadingHistory()
      const recent = history.slice(0, 3).map(item => {
        const manga = allMangas.find(m => m.slug === item.slug)
        if (manga) {
          return { ...item, manga }
        }
        return null
      }).filter(Boolean)
      
      setContinueReading(recent)
    } catch (error) {
      console.error('Error loading continue reading:', error)
    }
  }

  // Extract all unique genres
  const availableGenres = [...new Set(allMangas.flatMap(manga => manga.genres))].sort()

  // Hide intro animation after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = allMangas

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(manga => manga.status === statusFilter)
    }

    // Filter by genre
    if (genreFilter !== 'all') {
      filtered = filtered.filter(manga => manga.genres.includes(genreFilter))
    }

    setFilteredMangas(filtered)
  }, [searchTerm, statusFilter, genreFilter, allMangas])

  return (
    <>
      {/* Intro Animation - Minimal */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Logo */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="text-8xl font-black text-white font-mono tracking-tighter">
                  MX
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="h-1 bg-white mt-2"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent h-[600px] -z-10" />
          
          {/* Hero Slider */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            {sliders.length > 0 ? (
              <Slider slides={sliders} />
            ) : (
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-12 text-center border border-gray-700">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-white text-xl font-bold mb-2">Henüz Slider Eklenmemiş</h3>
                <p className="text-gray-400">Admin panelden slider ekleyerek başlayın</p>
              </div>
            )}
          </motion.div>

          {/* Continue Reading Section */}
          {continueReading.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-white">Okumaya Devam Et</h2>
                  </div>
                  <Link to="/history" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    Tümünü Gör →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {continueReading.map((item, index) => (
                    <motion.div
                      key={item.slug + item.chapterId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all group"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={item.cover} 
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded-lg border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium mb-1 truncate group-hover:text-purple-400 transition-colors">{item.title}</h3>
                          <p className="text-gray-400 text-xs mb-2">{item.chapterTitle}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{item.progress}%</span>
                          </div>
                          <Link to={`/manga/${item.slug}/chapter/${item.chapterId}`}>
                            <button className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors">
                              Devam Et
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Premium Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Manga */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{allMangas.length}</div>
                  <div className="text-sm text-gray-400 font-medium">Toplam Manga</div>
                </div>
              </motion.div>

              {/* Total Chapters */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {allMangas.reduce((sum, m) => sum + (m.chapters?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">Toplam Bölüm</div>
                </div>
              </motion.div>

              {/* Total Genres */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{availableGenres.length}</div>
                  <div className="text-sm text-gray-400 font-medium">Farklı Tür</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Recently Updated Section */}
        {recentlyUpdated.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Son Güncellemeler</h2>
                </div>
                <Link to="/discover" className="text-green-400 hover:text-green-300 text-sm font-medium">
                  Tümünü Keşfet →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {recentlyUpdated.map((manga, index) => (
                  <motion.div
                    key={manga.slug}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/manga/${manga.slug}`}>
                      <div className="group relative overflow-hidden rounded-xl">
                        <img
                          src={manga.cover}
                          alt={manga.title}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200?text=No+Image' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-white text-xs font-medium truncate">{manga.title}</p>
                          <p className="text-green-400 text-xs">Bölüm {Math.max(...manga.chapters.map(ch => parseInt(ch.id) || 0))}</p>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            YENİ
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Latest Chapters Section */}
        {latestChapters.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Yeni Eklenen Bölümler</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {latestChapters.map((chapter, index) => (
                  <motion.div
                    key={`${chapter.manga.slug}-${chapter.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/manga/${chapter.manga.slug}/chapter/${chapter.id}`}>
                      <div className="group bg-gray-800 hover:bg-gray-750 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-200">
                        <div className="flex gap-3 p-3">
                          <img
                            src={chapter.manga.cover}
                            alt={chapter.manga.title}
                            className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/64x80?text=?' }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-blue-400 transition-colors">
                              {chapter.manga.title}
                            </h3>
                            <p className="text-blue-400 text-xs font-medium mb-1">
                              Bölüm {chapter.id}
                            </p>
                            {chapter.title && chapter.title !== `Bölüm ${chapter.id}` && (
                              <p className="text-gray-400 text-xs truncate">
                                {chapter.title}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-2">
                              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">
                                YENİ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Section Title with Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Tüm Mangalar</h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-white to-transparent rounded-full"></div>
              </div>
              <div className="hidden sm:block text-sm text-gray-400">
                {filteredMangas.length} manga gösteriliyor
              </div>
            </div>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              En popüler mangaları keşfedin, favorilerinizi bulun ve okumaya başlayın
            </p>
          </motion.div>

          {/* Search & Filter */}
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            genreFilter={genreFilter}
            setGenreFilter={setGenreFilter}
            availableGenres={availableGenres}
          />

          {/* Manga Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : filteredMangas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredMangas.map((manga, index) => (
                  <motion.div
                    key={manga.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MangaCard manga={manga} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-lg">Manga bulunamadı</p>
                <p className="text-gray-600 text-sm mt-2">Farklı filtreler deneyin</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default HomePage
