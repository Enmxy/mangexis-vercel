import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'
import { startAutoRefresh, stopAutoRefresh } from '../utils/autoRefresh'
import Giscus from '../components/Giscus'
import OptimizedImage from '../components/OptimizedImage'
import imageUpscaler from '../utils/imageUpscaler'
import { addToHistory } from '../utils/readingHistory'
import { initImageProtection, protectImage } from '../utils/imageProtection'

const Reader = () => {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBar, setShowBar] = useState(true)
  const [selectedFansub, setSelectedFansub] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(() => {
    // Mobile: fit-width, Desktop: 50%
    return window.innerWidth < 768 ? 100 : 50
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const scrollContainerRef = useRef(null)
  const imageRefs = useRef([])

  // Initialize image protection
  useEffect(() => {
    initImageProtection()
  }, [])

  // Check if mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && zoomLevel < 100) {
        setZoomLevel(100)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load manga data
  useEffect(() => {
    loadManga()
    
    // Auto refresh every 10 seconds - cache bypass ile
    startAutoRefresh(async () => {
      await loadManga()
    })
    
    return () => {
      stopAutoRefresh()
    }
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

  const chapter = manga?.chapters.find(c => c.id === chapterId)
  const currentChapterIndex = manga?.chapters.findIndex(c => c.id === chapterId) ?? -1
  const prevChapter = currentChapterIndex > 0 ? manga.chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < (manga?.chapters.length ?? 0) - 1 ? manga.chapters[currentChapterIndex + 1] : null

  // Get current images
  const getCurrentImages = () => {
    if (!chapter) return []
    if (chapter.fansubs && chapter.fansubs[selectedFansub]?.images) {
      return chapter.fansubs[selectedFansub].images
    }
    return chapter.imageLinks || []
  }

  const images = getCurrentImages()

  // Save reading progress and history
  useEffect(() => {
    if (manga && chapter) {
      const key = `reading-progress-${manga.slug}`
      localStorage.setItem(key, JSON.stringify({
        chapterId: chapter.id,
        timestamp: Date.now()
      }))
      
      // Add to reading history
      addToHistory(manga, chapter.id, currentPage, images.length)
    }
  }, [manga, chapter, currentPage, images.length])

  // Restore scroll position
  useEffect(() => {
    if (chapter && images.length > 0) {
      const key = `scroll-position-${slug}-${chapterId}`
      const savedPosition = localStorage.getItem(key)
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition))
        }, 100)
      }
    }
  }, [chapter, images.length])

  // Track scroll progress and current page
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)

      // Calculate current page based on scroll position
      const viewportCenter = scrollTop + window.innerHeight / 2
      let foundPage = 1
      imageRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect()
          const elementTop = scrollTop + rect.top
          if (viewportCenter >= elementTop) {
            foundPage = index + 1
          }
        }
      })
      setCurrentPage(foundPage)
      setPageInput(foundPage.toString())

      // Save scroll position
      const key = `scroll-position-${slug}-${chapterId}`
      localStorage.setItem(key, scrollTop.toString())

      // Auto-hide bar
      clearTimeout(window.barTimer)
      setShowBar(true)
      window.barTimer = setTimeout(() => setShowBar(false), 2000)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug, chapterId])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          handleZoomIn()
        } else if (e.key === '-') {
          e.preventDefault()
          handleZoomOut()
        } else if (e.key === '0') {
          e.preventDefault()
          handleZoomReset()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [zoomLevel])

  // Pinch to zoom for mobile
  useEffect(() => {
    let initialDistance = 0
    let initialZoom = zoomLevel

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        initialZoom = zoomLevel
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        const scale = currentDistance / initialDistance
        const newZoom = Math.min(Math.max(initialZoom * scale, 50), 200)
        setZoomLevel(Math.round(newZoom))
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [zoomLevel])

  // Tap controls - Mobile only
  const handleTap = (e) => {
    if (!isMobile) return
    
    const clickX = e.clientX
    const windowWidth = window.innerWidth
    
    if (clickX < windowWidth * 0.3) {
      // Left tap - Previous page
      jumpToPage(currentPage - 1)
    } else if (clickX > windowWidth * 0.7) {
      // Right tap - Next page  
      jumpToPage(currentPage + 1)
    } else {
      // Center tap - Toggle bar
      setShowBar(!showBar)
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Zoom controls
  const handleZoomIn = () => {
    if (zoomLevel < 200) setZoomLevel(prev => Math.min(200, prev + 10))
  }

  const handleZoomOut = () => {
    if (zoomLevel > 50) setZoomLevel(prev => Math.max(50, prev - 10))
  }

  const handleZoomReset = () => {
    setZoomLevel(isMobile ? 100 : 50)
  }

  const jumpToPage = (pageNumber) => {
    const targetPage = Math.max(1, Math.min(pageNumber, images.length))
    const targetRef = imageRefs.current[targetPage - 1]
    if (targetRef) {
      const rect = targetRef.getBoundingClientRect()
      const scrollTop = window.scrollY + rect.top - 100
      window.scrollTo({ top: scrollTop, behavior: 'smooth' })
    }
  }

  const handlePageInput = (e) => {
    const value = e.target.value
    setPageInput(value)
    const pageNum = parseInt(value)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= images.length) {
      jumpToPage(pageNum)
    }
  }

  const handlePageInputBlur = () => {
    setPageInput(currentPage.toString())
  }

  // Chapter change
  const handleChapterChange = (newChapterId) => {
    navigate(`/manga/${slug}/chapter/${newChapterId}`)
    window.scrollTo(0, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#EDEDED]/20 border-t-[#EDEDED] rounded-full animate-spin" />
      </div>
    )
  }

  if (!manga || !chapter) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#EDEDED] text-xl mb-4">❌ Bölüm bulunamadı</p>
          <Link to={`/manga/${slug}`}>
            <button className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all font-bold">
              ← Manga Sayfasına Dön
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]" style={{ scrollBehavior: 'smooth' }}>
      {/* Fixed Reader Bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 border-b border-[#EDEDED]/10 backdrop-blur-sm"
          >
            <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
              {/* Mobile Layout */}
              <div className="md:hidden flex flex-col gap-2">
                {/* Top Row: Back + Page Navigation */}
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/manga/${slug}`}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 bg-[#EDEDED] text-[#0A0A0A] rounded transition-all"
                      title="Geri"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </motion.button>
                  </Link>

                  {/* Page Jump - Mobile */}
                  <div className="flex items-center gap-0.5 bg-[#EDEDED] rounded px-1.5 py-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage - 1)}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={currentPage <= 1}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <input
                      type="number"
                      min="1"
                      max={images.length}
                      value={pageInput}
                      onChange={handlePageInput}
                      onBlur={handlePageInputBlur}
                      className="w-8 px-0.5 py-0.5 text-center text-xs font-bold bg-white text-[#0A0A0A] rounded border-none focus:outline-none"
                    />
                    <span className="text-xs text-[#0A0A0A] font-medium">/{images.length}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage + 1)}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={currentPage >= images.length}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Zoom - Mobile */}
                  <div className="flex items-center gap-0.5 bg-[#EDEDED] rounded px-1 py-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomOut}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={zoomLevel <= 50}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </motion.button>
                    <span className="text-xs text-[#0A0A0A] font-bold min-w-[28px] text-center">{zoomLevel}%</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomIn}
                      className="p-0.5 text-[#0A0A0A] rounded transition-all"
                      disabled={zoomLevel >= 200}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Bottom Row: Chapter Navigation */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-center">
                    {prevChapter && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChapterChange(prevChapter.id)}
                        className="px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded transition-all text-xs font-bold"
                      >
                        ←
                      </motion.button>
                    )}
                    <select
                      value={chapterId}
                      onChange={(e) => handleChapterChange(e.target.value)}
                      className="flex-1 px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded text-xs font-bold cursor-pointer focus:outline-none focus:bg-white transition-all"
                    >
                      {manga.chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                    </select>
                    {nextChapter && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChapterChange(nextChapter.id)}
                        className="px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded transition-all text-xs font-bold"
                      >
                        →
                      </motion.button>
                    )}
                  </div>
                  {/* Fansub Selector - Mobile */}
                  {chapter.fansubs && chapter.fansubs.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#EDEDED]/60 text-xs font-medium">Çeviri:</span>
                      <select
                        value={selectedFansub}
                        onChange={(e) => setSelectedFansub(parseInt(e.target.value))}
                        className="flex-1 px-2 py-1 bg-[#EDEDED] text-[#0A0A0A] rounded text-xs font-bold cursor-pointer focus:outline-none focus:bg-white transition-all"
                        disabled={chapter.fansubs.length === 1}
                      >
                        {chapter.fansubs.map((fansub, index) => (
                          <option key={index} value={index}>
                            {fansub.name || `Fansub ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between gap-3">
                {/* Left: Back */}
                <Link to={`/manga/${slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all"
                    title="Geri"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </motion.button>
                </Link>

                {/* Center: Chapter Controls */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  {prevChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterChange(prevChapter.id)}
                      className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all text-sm font-bold"
                      title="Önceki Bölüm"
                    >
                      ←
                    </motion.button>
                  )}

                  <select
                    value={chapterId}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] rounded text-sm font-bold cursor-pointer focus:outline-none focus:bg-white transition-all max-w-[200px]"
                  >
                    {manga.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>

                  {nextChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterChange(nextChapter.id)}
                      className="px-3 py-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all text-sm font-bold"
                      title="Sonraki Bölüm"
                    >
                      →
                    </motion.button>
                  )}
                </div>

                {/* Right: Page Navigation & Settings - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Page Jump Controls */}
                  <div className="flex items-center gap-1 bg-[#EDEDED] rounded px-2 py-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(1)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="İlk Sayfa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage - 1)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Önceki Sayfa"
                      disabled={currentPage <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <input
                      type="number"
                      min="1"
                      max={images.length}
                      value={pageInput}
                      onChange={handlePageInput}
                      onBlur={handlePageInputBlur}
                      className="w-12 px-1 py-1 text-center text-xs font-bold bg-white text-[#0A0A0A] rounded border-none focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                    <span className="text-xs text-[#0A0A0A] font-medium">/ {images.length}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(currentPage + 1)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Sonraki Sayfa"
                      disabled={currentPage >= images.length}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => jumpToPage(images.length)}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Son Sayfa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Fansub Selector - Desktop */}
                  {chapter.fansubs && chapter.fansubs.length > 0 && (
                    <div className="flex items-center gap-2 bg-[#EDEDED] rounded px-3 py-2">
                      <svg className="w-4 h-4 text-[#0A0A0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <select
                        value={selectedFansub}
                        onChange={(e) => setSelectedFansub(parseInt(e.target.value))}
                        className="bg-transparent text-[#0A0A0A] text-xs font-bold cursor-pointer focus:outline-none"
                        disabled={chapter.fansubs.length === 1}
                      >
                        {chapter.fansubs.map((fansub, index) => (
                          <option key={index} value={index}>
                            {fansub.name || `Fansub ${index + 1}`}
                          </option>
                        ))}
                      </select>
                      {chapter.fansubs.length > 1 && (
                        <span className="text-[#0A0A0A]/60 text-[10px]">
                          ({chapter.fansubs.length} çeviri)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-[#EDEDED] rounded px-2 py-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomOut}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Zoom Out"
                      disabled={zoomLevel <= 50}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleZoomReset}
                      className="px-2 py-1 text-[#0A0A0A] hover:bg-white rounded transition-all text-xs font-bold"
                      title="Reset Zoom"
                    >
                      {zoomLevel}%
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomIn}
                      className="p-1 text-[#0A0A0A] hover:bg-white rounded transition-all"
                      title="Zoom In"
                      disabled={zoomLevel >= 200}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFullscreen}
                    className="p-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all"
                    title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full h-1 bg-[#EDEDED]/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ duration: 0.1 }}
                    className="h-full bg-[#EDEDED]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Scroll Images */}
      <div 
        ref={scrollContainerRef}
        className="mx-auto pt-20"
        onClick={handleTap}
        style={{
          maxWidth: `${zoomLevel}%`,
          transition: 'max-width 0.3s ease-out'
        }}
      >
        {images.map((imageUrl, index) => {
          const isLastImage = index === images.length - 1
          
          const handleScrollToNext = () => {
            if (!isLastImage && imageRefs.current[index + 1]) {
              imageRefs.current[index + 1].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              })
            }
          }
          
          return (
          <div key={index} className="w-full">
            {/* Fansub Info - İlk sayfanın üstünde */}
            {index === 0 && chapter.fansubs && chapter.fansubs[selectedFansub] && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 mx-auto max-w-2xl"
              >
                <div className="bg-[#EDEDED]/10 backdrop-blur-sm border border-[#EDEDED]/20 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[#EDEDED] font-bold text-lg">{chapter.fansubs[selectedFansub].name}</p>
                        <p className="text-[#EDEDED]/60 text-xs">Çeviri Grubu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {chapter.fansubs[selectedFansub].website && (
                        <a
                          href={chapter.fansubs[selectedFansub].website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded-lg transition-all group"
                          title="Website"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                      {chapter.fansubs[selectedFansub].discord && (
                        <a
                          href={chapter.fansubs[selectedFansub].discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-all group"
                          title="Discord"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Resim Container with Custom Cursor */}
            <div 
              ref={(el) => (imageRefs.current[index] = el)}
              className="relative"
              style={{
                cursor: !isMobile && !isLastImage 
                  ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2"><path d="M12 4v16m0 0l-6-6m6 6l6-6"/></svg>') 12 12, auto`
                  : 'default'
              }}
              onClick={(e) => {
                if (!isMobile && !isLastImage) {
                  e.stopPropagation()
                  handleScrollToNext()
                }
              }}
            >
              <OptimizedImage
                src={imageUrl}
                alt={`Sayfa ${index + 1}`}
                index={index}
                preloadNext={index < images.length - 1}
                className="pointer-events-none"
              />
            </div>
          </div>
        )
        })}

        {/* End of Chapter - Comments */}
        <div className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Chapter Navigation */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#EDEDED]/10">
              {prevChapter ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChapterChange(prevChapter.id)}
                  className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all font-bold"
                >
                  ← {prevChapter.title}
                </motion.button>
              ) : (
                <div />
              )}

              {nextChapter ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChapterChange(nextChapter.id)}
                  className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white rounded transition-all font-bold"
                >
                  {nextChapter.title} →
                </motion.button>
              ) : (
                <div />
              )}
            </div>

            {/* Comments Section */}
            {manga && chapter && (
              <Giscus 
                key={`${manga.slug}-${chapter.id}`}
                term={`${manga.title} - Bölüm ${chapter.id}`}
                category="Bölümler"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tap Zones Hint (First Load) */}
      <AnimatePresence>
        {showBar && scrollProgress < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="bg-[#EDEDED] px-6 py-3 rounded-full shadow-lg">
              <p className="text-sm text-[#0A0A0A] font-mono">
                Sol: Önceki | Orta: Menü | Sağ: Sonraki
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reader
