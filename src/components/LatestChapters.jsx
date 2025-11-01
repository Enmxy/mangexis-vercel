import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const LatestChapters = ({ latestChapters }) => {
  if (!latestChapters || latestChapters.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Yeni Eklenen Bölümler</h2>
          <p className="text-gray-400">En son yüklenen manga bölümleri</p>
        </div>
        <Link
          to="/discover"
          className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
        >
          Tümünü Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {latestChapters.slice(0, 4).map((item, index) => (
          <motion.div
            key={`${item.manga.slug}-${item.chapter.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/manga/${item.manga.slug}/read/${item.chapter.id}`}
              className="group block bg-gray-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              {/* Cover Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.manga.cover}
                  alt={item.manga.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* New Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                    YENİ
                  </span>
                </div>

                {/* Chapter Number Badge */}
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-lg">
                    Bölüm {item.chapter.id}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-bold text-base mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                  {item.manga.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-1 mb-2">
                  {item.chapter.title}
                </p>

                {/* Fansub Info */}
                {item.chapter.fansubs && item.chapter.fansubs.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-500">
                      {item.chapter.fansubs[0].name}
                    </span>
                  </div>
                )}

                {/* Page Count */}
                <div className="flex items-center gap-2 text-xs mt-2 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {item.chapter.fansubs && item.chapter.fansubs[0]?.images.length 
                      ? item.chapter.fansubs[0].images.length 
                      : item.chapter.imageLinks?.length || 0} sayfa
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default LatestChapters
