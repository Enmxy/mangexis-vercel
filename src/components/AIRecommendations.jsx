import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAIRecommendations, getPersonalizedMessage } from '../utils/aiRecommendations'
import { getAllMangas } from '../utils/mangaService'
import { mangaList } from '../data/mangaData'

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [personalizedMessage, setPersonalizedMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadRecommendations()
  }, [refreshKey])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      // Get all manga
      const apiMangas = await getAllMangas()
      const allManga = [...mangaList, ...apiMangas]
      
      // Get AI recommendations
      const recs = getAIRecommendations(allManga, null, 6)
      setRecommendations(recs)
      setPersonalizedMessage(getPersonalizedMessage())
    } catch (error) {
      console.error('Error loading recommendations:', error)
      // Fallback to popular manga
      setRecommendations(mangaList.slice(0, 6))
      setPersonalizedMessage('Size özel öneriler')
    } finally {
      setLoading(false)
    }
  }

  const refreshRecommendations = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-64 bg-[#EDEDED]/10 rounded animate-pulse" />
            <div className="h-10 w-32 bg-[#EDEDED]/10 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#EDEDED]/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-12 px-4 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-[#EDEDED] text-xl md:text-2xl font-bold">AI Öneriler</h2>
              <p className="text-[#EDEDED]/70 text-sm mt-1">{personalizedMessage}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshRecommendations}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </motion.button>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          <AnimatePresence mode="wait">
            {recommendations.map((manga, index) => (
              <motion.div
                key={`${manga.slug}-${refreshKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/manga/${manga.slug}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative h-full"
                  >
                    {/* AI Score Badge */}
                    {manga.aiScore && (
                      <div className="absolute -top-2 -right-2 z-20 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                        {Math.round(manga.aiScore * 100)}% Uyumlu
                      </div>
                    )}

                    {/* Cover */}
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#EDEDED]/10 shadow-xl group-hover:shadow-2xl transition-all">
                      {manga.cover && (
                        <img
                          src={manga.cover}
                          alt={manga.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* AI Reason */}
                      {manga.aiReason && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-xs font-medium bg-black/50 backdrop-blur px-2 py-1 rounded">
                            🎯 {manga.aiReason}
                          </p>
                        </div>
                      )}

                      {/* Sparkle effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping" />
                        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white rounded-full animate-ping animation-delay-200" />
                        <div className="absolute bottom-1/4 left-3/4 w-2 h-2 bg-white rounded-full animate-ping animation-delay-400" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mt-3">
                      <h3 className="text-[#EDEDED] text-sm font-bold line-clamp-1 group-hover:text-white transition-colors">
                        {manga.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#EDEDED]/50 text-xs">
                          {manga.chapters?.length || 0} Bölüm
                        </span>
                        {manga.rating && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="text-[#EDEDED]/50 text-xs">{manga.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-[#EDEDED]/20 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#EDEDED]/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-[#EDEDED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-[#EDEDED] font-bold text-sm mb-1">AI Nasıl Çalışır?</h4>
              <p className="text-[#EDEDED]/60 text-xs leading-relaxed">
                Yapay zeka algoritması okuma geçmişinizi, verdiğiniz puanları, tür tercihlerinizi ve benzer okuyucuların davranışlarını analiz ederek size özel öneriler sunar. Her yenilemede farklı sonuçlar görebilirsiniz.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </motion.section>
  )
}

export default AIRecommendations
