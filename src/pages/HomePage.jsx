import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Slider from '../components/Slider'
import SearchFilter from '../components/SearchFilter'
import MangaCard from '../components/MangaCard'
import { sliderData, mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [allMangas, setAllMangas] = useState(mangaList)
  const [filteredMangas, setFilteredMangas] = useState(mangaList)
  const [showIntro, setShowIntro] = useState(true)
  const [loading, setLoading] = useState(true)
  const [continueReading, setContinueReading] = useState(null)

  // Load mangas from API/localStorage + static data
  useEffect(() => {
    loadAllMangas()
    loadContinueReading()
  }, [])

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
      const allProgress = Object.keys(localStorage)
        .filter(key => key.startsWith('reading-progress-'))
        .map(key => {
          const data = JSON.parse(localStorage.getItem(key))
          const slug = key.replace('reading-progress-', '')
          return { ...data, slug, key }
        })
        .sort((a, b) => b.timestamp - a.timestamp)

      if (allProgress.length > 0) {
        const latest = allProgress[0]
        const manga = mangaList.find(m => m.slug === latest.slug)
        if (manga) {
          const chapter = manga.chapters.find(c => c.id === latest.chapterId)
          setContinueReading({ manga, chapter })
        }
      }
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
      {/* Loading Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-mono text-white mb-2">
                MangeXis
              </h1>
              <p className="text-tertiary text-xs sm:text-sm tracking-widest">
                PREMIUM MANGA PLATFORM
              </p>
            </motion.div>

            {/* Loading Spinner */}
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent h-[600px] -z-10" />
          
          {/* Hero Slider */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            <Slider slides={sliderData} />
          </motion.div>

          {/* Continue Reading Section */}
          {continueReading && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">Okumaya Devam Et</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <img 
                    src={continueReading.manga.cover} 
                    alt={continueReading.manga.title}
                    className="w-20 h-28 object-cover rounded-lg border border-white/10"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{continueReading.manga.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{continueReading.chapter?.title || 'Bölüm'}</p>
                    <Link to={`/manga/${continueReading.manga.slug}/chapter/${continueReading.chapter?.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Devam Et
                      </motion.button>
                    </Link>
                  </div>
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
