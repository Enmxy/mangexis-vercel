import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import Comments from '../components/Comments'

const Reader = () => {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const manga = mangaList.find(m => m.slug === slug)
  const chapter = manga?.chapters.find(c => c.id === chapterId)

  const [currentPage, setCurrentPage] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [selectedFansub, setSelectedFansub] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' && currentPage < chapter.imageLinks.length - 1) {
        setCurrentPage(prev => prev + 1)
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage(prev => prev - 1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, chapter])

  const handleMouseMove = () => {
    setShowControls(true)
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }

  const handleImageClick = () => {
    if (currentPage < chapter.imageLinks.length - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleChapterChange = (newChapterId) => {
    navigate(`/manga/${slug}/chapter/${newChapterId}`)
    setCurrentPage(0)
  }

  const currentChapterIndex = manga.chapters.findIndex(c => c.id === chapterId)
  const prevChapter = currentChapterIndex > 0 ? manga.chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < manga.chapters.length - 1 ? manga.chapters[currentChapterIndex + 1] : null

  if (!manga || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-tertiary text-xl">Bölüm bulunamadı</p>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-black cursor-pointer"
      onMouseMove={handleMouseMove}
    >
      {/* Reader Controls Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                {/* Manga & Chapter Info */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <Link to={`/manga/${slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-custom text-xs sm:text-sm font-medium hover:bg-white/20 transition-all duration-200"
                    >
                      ← Geri
                    </motion.button>
                  </Link>
                  <div className="hidden sm:block">
                    <h2 className="text-base sm:text-lg font-semibold">{manga.title}</h2>
                    <p className="text-xs sm:text-sm text-tertiary">{chapter.title}</p>
                  </div>
                </div>

                {/* Chapter Navigation */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {prevChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleChapterChange(prevChapter.id)}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-custom text-xs sm:text-sm font-medium hover:bg-white/20 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">← Önceki</span>
                      <span className="sm:hidden">←</span>
                    </motion.button>
                  )}

                  <select
                    value={chapterId}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-black/50 border border-white/20 rounded-custom text-xs sm:text-sm font-medium cursor-pointer focus:outline-none focus:border-white/40 transition-all duration-200 max-w-[120px] sm:max-w-none"
                  >
                    {manga.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title}
                      </option>
                    ))}
                  </select>

                  {/* Fansub Selector */}
                  {chapter.fansubs && chapter.fansubs.length > 1 && (
                    <select
                      value={selectedFansub}
                      onChange={(e) => setSelectedFansub(parseInt(e.target.value))}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 bg-black/50 border border-white/20 rounded-custom text-xs sm:text-sm font-medium cursor-pointer focus:outline-none focus:border-white/40 transition-all duration-200"
                    >
                      {chapter.fansubs.map((fansub, index) => (
                        <option key={index} value={index}>
                          {fansub.name || `Fansub ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  {nextChapter && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleChapterChange(nextChapter.id)}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-custom text-xs sm:text-sm font-medium hover:bg-white/20 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">Sonraki →</span>
                      <span className="sm:hidden">→</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Page Progress */}
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-tertiary mb-2">
                  <span>Sayfa {currentPage + 1} / {chapter.imageLinks.length}</span>
                  <span>{Math.round(((currentPage + 1) / chapter.imageLinks.length) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentPage + 1) / chapter.imageLinks.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Display */}
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <motion.img
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          src={chapter.fansubs && chapter.fansubs[selectedFansub]?.images[currentPage] || chapter.imageLinks[currentPage]}
          alt={`Page ${currentPage + 1}`}
          onClick={handleImageClick}
          className="max-w-full max-h-screen object-contain cursor-pointer"
        />
      </div>

      {/* Navigation Hints */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10">
              <p className="text-xs sm:text-sm text-tertiary">
                <span className="hidden sm:inline">Tıkla veya → tuşu ile sonraki sayfa</span>
                <span className="sm:hidden">Tıkla → Sonraki sayfa</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section - After last page */}
      {currentPage === chapter.imageLinks.length - 1 && (
        <div className="max-w-4xl mx-auto px-4 py-12 bg-black">
          <Comments 
            identifier={`chapter-${manga.slug}-${chapterId}`}
            title={`${manga.title} - ${chapter.title}`}
          />
        </div>
      )}
    </div>
  )
}

export default Reader
