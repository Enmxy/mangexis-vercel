import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import { startAutoRefresh, stopAutoRefresh } from '../utils/autoRefresh'
import SearchFilter from '../components/SearchFilter'
import MangaCard from '../components/MangaCard'

const Discover = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedGenres, setSelectedGenres] = useState([])
  const [sortBy, setSortBy] = useState('title-asc')
  const [allMangas, setAllMangas] = useState(mangaList)
  const [loading, setLoading] = useState(true)

  // Load mangas from API/localStorage + static data
  useEffect(() => {
    loadAllMangas()
    
    // Auto refresh every 5 seconds
    startAutoRefresh(async () => {
      await loadAllMangas()
    }, 5)
    
    return () => {
      stopAutoRefresh()
    }
  }, [])

  const loadAllMangas = async () => {
    setLoading(true)
    try {
      const apiMangas = await getAllMangas()
      const combined = [...mangaList, ...apiMangas]
      const unique = combined.reduce((acc, manga) => {
        if (!acc.find(m => m.slug === manga.slug)) {
          acc.push(manga)
        }
        return acc
      }, [])
      setAllMangas(unique)
    } catch (error) {
      console.error('Error loading mangas:', error)
      setAllMangas(mangaList)
    } finally {
      setLoading(false)
    }
  }

  // Get all unique genres from manga data
  const allGenres = useMemo(() => {
    const genres = new Set()
    allMangas.forEach(manga => {
      manga.genres.forEach(genre => genres.add(genre))
    })
    return Array.from(genres).sort()
  }, [allMangas])

  // Filter manga with 100% accuracy
  const filteredMangas = useMemo(() => {
    let result = [...allMangas]

    // 1. Search filter - case insensitive, matches title
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter(manga => 
        manga.title.toLowerCase().includes(searchLower)
      )
    }

    // 2. Status filter - exact match
    if (selectedStatus !== 'all') {
      result = result.filter(manga => manga.status === selectedStatus)
    }

    // 3. Genre filter - must have ALL selected genres
    if (selectedGenres.length > 0) {
      result = result.filter(manga => 
        selectedGenres.every(selectedGenre => 
          manga.genres.includes(selectedGenre)
        )
      )
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title, 'tr')
        case 'title-desc':
          return b.title.localeCompare(a.title, 'tr')
        case 'chapters-asc':
          return a.chapters.length - b.chapters.length
        case 'chapters-desc':
          return b.chapters.length - a.chapters.length
        default:
          return 0
      }
    })

    return result
  }, [searchTerm, selectedStatus, selectedGenres, sortBy, allMangas])

  // Toggle genre selection
  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setSelectedGenres([])
    setSortBy('title-asc')
  }

  // Check if any filter is active
  const hasActiveFilters = searchTerm || selectedStatus !== 'all' || selectedGenres.length > 0 || sortBy !== 'title-asc'

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-shadow-glow">Keşfet</h1>
          <p className="text-tertiary text-sm sm:text-base lg:text-lg">
            {filteredMangas.length} manga bulundu
            {hasActiveFilters && ' (filtrelenmiş)'}
          </p>
        </motion.div>

        {/* Advanced Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-effect rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-white/10"
        >
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-tertiary mb-2">
              Manga Ara
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Manga adı yazın..."
              className="w-full bg-black/50 border border-white/20 rounded-custom px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-tertiary focus:outline-none focus:border-white/40 transition-all duration-200"
            />
          </div>

          {/* Status & Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-tertiary mb-2">
                Durum
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-custom px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/40 transition-all duration-200 cursor-pointer"
              >
                <option value="all">Tümü</option>
                <option value="ongoing">Devam Ediyor</option>
                <option value="finished">Bitti</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-tertiary mb-2">
                Sıralama
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-custom px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/40 transition-all duration-200 cursor-pointer"
              >
                <option value="title-asc">İsim (A-Z)</option>
                <option value="title-desc">İsim (Z-A)</option>
                <option value="chapters-desc">En Çok Bölüm</option>
                <option value="chapters-asc">En Az Bölüm</option>
              </select>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-tertiary mb-3">
              Türler {selectedGenres.length > 0 && `(${selectedGenres.length} seçili)`}
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {allGenres.map((genre) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-custom text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedGenres.includes(genre)
                      ? 'bg-white text-black border-2 border-white'
                      : 'bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/40'
                  }`}
                >
                  {genre}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={clearFilters}
                className="px-4 sm:px-6 py-2 bg-white/10 border border-white/20 rounded-custom text-xs sm:text-sm font-medium hover:bg-white/20 hover:border-white/40 transition-all duration-200"
              >
                Filtreleri Temizle
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 flex flex-wrap gap-2 items-center"
          >
            <span className="text-xs sm:text-sm text-tertiary">Aktif Filtreler:</span>
            
            {searchTerm && (
              <span className="px-2 sm:px-3 py-1 bg-white/10 border border-white/20 rounded-custom text-xs sm:text-sm">
                Arama: "{searchTerm}"
              </span>
            )}
            
            {selectedStatus !== 'all' && (
              <span className="px-2 sm:px-3 py-1 bg-white/10 border border-white/20 rounded-custom text-xs sm:text-sm">
                Durum: {selectedStatus === 'ongoing' ? 'Devam Ediyor' : 'Bitti'}
              </span>
            )}
            
            {selectedGenres.map(genre => (
              <span key={genre} className="px-2 sm:px-3 py-1 bg-white text-black rounded-custom text-xs sm:text-sm font-medium">
                {genre}
              </span>
            ))}
          </motion.div>
        )}

        {/* Results Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredMangas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <p className="text-tertiary text-lg sm:text-xl mb-2">Manga bulunamadı</p>
              <p className="text-tertiary text-xs sm:text-sm">Filtreleri değiştirerek tekrar deneyin</p>
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={clearFilters}
                  className="mt-6 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-black rounded-custom font-medium hover:shadow-lg hover:shadow-white/20 transition-all duration-200"
                >
                  Tüm Mangaları Göster
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Discover
