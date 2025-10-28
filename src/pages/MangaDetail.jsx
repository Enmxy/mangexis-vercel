import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mangaList } from '../data/mangaData'
import { getAllMangas } from '../utils/mangaService'

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12"
        >
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg overflow-hidden shadow-2xl"
            >
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Manga Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-shadow-glow">
              {manga.title}
            </h1>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-custom ${
                manga.status === 'ongoing'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white border border-white/30'
              }`}>
                {manga.status === 'ongoing' ? 'Devam Ediyor' : 'Bitti'}
              </span>
            </div>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-tertiary mb-2 sm:mb-3">Türler</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 border border-white/20 rounded-custom text-xs sm:text-sm hover:bg-white/10 transition-colors duration-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-xs sm:text-sm font-medium text-tertiary mb-2 sm:mb-3">Açıklama</h3>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                {manga.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chapter List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Bölümler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {manga.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/manga/${manga.slug}/chapter/${chapter.id}`}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="glass-effect border border-white/10 rounded-lg p-3 sm:p-4 hover:border-white/30 transition-all duration-200 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-medium group-hover:text-shadow-glow transition-all duration-200">
                    {chapter.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-tertiary mt-1">
                    {chapter.imageLinks.length} sayfa
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MangaDetail
