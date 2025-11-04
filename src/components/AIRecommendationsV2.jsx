import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAIRecommendations, getPersonalizedMessage } from '../utils/aiRecommendations'
import { getAllMangas } from '../utils/mangaService'
import { mangaList } from '../data/mangaData'

const AIRecommendationsV2 = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [personalizedMessage, setPersonalizedMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredIndex, setHoveredIndex] = useState(null)

  useEffect(() => {
    loadRecommendations()
  }, [refreshKey])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const apiMangas = await getAllMangas()
      const allManga = [...mangaList, ...apiMangas]
      
      const recs = getAIRecommendations(allManga, null, 12)
      setRecommendations(recs)
      setPersonalizedMessage(getPersonalizedMessage())
    } catch (error) {
      console.error('Error loading recommendations:', error)
      setRecommendations(mangaList.slice(0, 12))
      setPersonalizedMessage('Size özel öneriler')
    } finally {
      setLoading(false)
    }
  }

  const refreshRecommendations = () => {
    setRefreshKey(prev => prev + 1)
  }

  const categories = [
    { id: 'all', label: 'Tümü', icon: '🎯' },
    { id: 'trending', label: 'Trend', icon: '🔥' },
    { id: 'new', label: 'Yeni', icon: '✨' },
    { id: 'completed', label: 'Tamamlanmış', icon: '✅' }
  ]

  const filteredRecs = recommendations.filter(manga => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'trending') return manga.views > 5000
    if (selectedCategory === 'new') return manga.year >= 2023
    if (selectedCategory === 'completed') return manga.status === 'Tamamlandı'
    return true
  })

  if (loading) {
    return (
      <div className="py-16 px-4 bg-gradient-to-b from-[#0A0A0A] to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="h-12 w-80 bg-[#EDEDED]/10 rounded-xl animate-pulse" />
            <div className="h-12 w-40 bg-[#EDEDED]/10 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#EDEDED]/10 rounded-2xl animate-pulse" />
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
      className="py-16 px-4 relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-black to-[#0A0A0A]"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/10 to-transparent rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-transparent rounded-full filter blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-4 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl shadow-2xl"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </motion.div>
              <div>
                <h2 className="text-[#EDEDED] text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  AI Öneriler v2.0
                </h2>
                <p className="text-[#EDEDED]/70 text-base md:text-lg">{personalizedMessage}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshRecommendations}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold transition-all flex items-center gap-3 shadow-2xl hover:shadow-purple-500/50"
            >
              <motion.svg
                animate={{ rotate: refreshKey * 360 }}
                transition={{ duration: 0.5 }}
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
              Yenile
            </motion.button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-[#EDEDED]/10 text-[#EDEDED]/70 hover:bg-[#EDEDED]/20'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-[#EDEDED]/5 to-[#EDEDED]/10 rounded-2xl border border-[#EDEDED]/20">
            <div className="text-center">
              <p className="text-3xl font-black text-white mb-1">{filteredRecs.length}</p>
              <p className="text-[#EDEDED]/60 text-sm">Öneri</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white mb-1">
                {Math.round(filteredRecs.reduce((sum, r) => sum + (r.aiConfidence || 0), 0) / filteredRecs.length)}%
              </p>
              <p className="text-[#EDEDED]/60 text-sm">Ortalama Uyum</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white mb-1">
                {new Set(filteredRecs.flatMap(r => r.genre?.split(',') || [])).size}
              </p>
              <p className="text-[#EDEDED]/60 text-sm">Farklı Tür</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white mb-1">5</p>
              <p className="text-[#EDEDED]/60 text-sm">AI Stratejisi</p>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((manga, index) => (
              <motion.div
                key={`${manga.slug}-${refreshKey}`}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Link to={`/manga/${manga.slug}`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group relative h-full"
                  >
                    {/* AI Confidence Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                      className="absolute -top-3 -right-3 z-20"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-md opacity-75" />
                        <div className="relative px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black rounded-full shadow-xl">
                          {manga.aiConfidence || 95}%
                        </div>
                      </div>
                    </motion.div>

                    {/* Rank Badge */}
                    {index < 3 && (
                      <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-yellow-500 text-black text-xs font-black rounded-lg shadow-lg">
                        #{index + 1}
                      </div>
                    )}

                    {/* Cover */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#EDEDED]/10 shadow-2xl group-hover:shadow-purple-500/30 transition-all">
                      {manga.cover && (
                        <motion.img
                          src={manga.cover}
                          alt={manga.title}
                          className="w-full h-full object-cover"
                          animate={{
                            scale: hoveredIndex === index ? 1.1 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      {/* Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Hover Content */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: hoveredIndex === index ? 1 : 0,
                          y: hoveredIndex === index ? 0 : 20
                        }}
                        className="absolute inset-0 p-4 flex flex-col justify-end"
                      >
                        {/* AI Reason */}
                        {manga.aiReason && (
                          <div className="mb-3">
                            <div className="px-3 py-2 bg-black/70 backdrop-blur-md rounded-lg">
                              <p className="text-white text-xs font-bold leading-relaxed">
                                🎯 {manga.aiReason}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Quick Stats */}
                        <div className="flex items-center gap-2 text-white/90 text-xs">
                          {manga.chapters?.length && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur rounded-full">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {manga.chapters.length}
                            </span>
                          )}
                          {manga.rating && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/30 backdrop-blur rounded-full">
                              <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              {manga.rating}
                            </span>
                          )}
                        </div>
                      </motion.div>

                      {/* Animated Border */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{
                          boxShadow: hoveredIndex === index 
                            ? '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)'
                            : '0 0 0px rgba(147, 51, 234, 0)'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Title & Info */}
                    <div className="mt-4 px-1">
                      <h3 className="text-[#EDEDED] text-sm md:text-base font-bold line-clamp-2 group-hover:text-white transition-colors mb-2 leading-tight">
                        {manga.title}
                      </h3>
                      
                      {/* Genre Pills */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {manga.genre?.split(',').slice(0, 2).map((genre, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#EDEDED]/10 text-[#EDEDED]/60 text-xs rounded-full"
                          >
                            {genre.trim()}
                          </span>
                        ))}
                      </div>

                      {/* AI Score Bar */}
                      <div className="w-full h-1.5 bg-[#EDEDED]/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${manga.aiConfidence || 95}%` }}
                          transition={{ delay: index * 0.05 + 0.5, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 md:p-8 bg-gradient-to-br from-[#EDEDED]/10 via-[#EDEDED]/5 to-transparent border border-[#EDEDED]/20 rounded-3xl backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex-shrink-0">
              <svg className="w-8 h-8 text-[#EDEDED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-[#EDEDED] font-black text-lg md:text-xl mb-3">
                🧠 Gelişmiş AI Motoru v2.0
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-[#EDEDED]/70 text-sm leading-relaxed">
                <div>
                  <p className="font-bold text-[#EDEDED] mb-2">📊 5 Farklı Strateji:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• İçerik Benzerliği (%35)</li>
                    <li>• Kullanıcı Tercihleri (%25)</li>
                    <li>• İşbirlikçi Filtreleme (%20)</li>
                    <li>• Zamansal Analiz (%10)</li>
                    <li>• Çeşitlilik Optimizasyonu (%10)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-[#EDEDED] mb-2">🎯 Akıllı Özellikler:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Okuma davranışı analizi</li>
                    <li>• Binge-reading tespiti</li>
                    <li>• Tamamlama oranı hesaplama</li>
                    <li>• Filtre balonu önleme</li>
                    <li>• Gerçek zamanlı güncelleme</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default AIRecommendationsV2
