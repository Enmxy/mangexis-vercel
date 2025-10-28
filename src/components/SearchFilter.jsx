import { motion } from 'framer-motion'

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  genreFilter, 
  setGenreFilter, 
  availableGenres 
}) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-effect rounded-lg p-6 mb-8 border border-white/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-tertiary mb-2">
            Ara
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Manga ara..."
            className="w-full bg-black/50 border border-white/20 rounded-custom px-4 py-2.5 text-white placeholder-tertiary focus:outline-none focus:border-white/40 transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-tertiary mb-2">
            Durum
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-black/50 border border-white/20 rounded-custom px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-all duration-200 cursor-pointer"
          >
            <option value="all">Tümü</option>
            <option value="ongoing">Devam Ediyor</option>
            <option value="finished">Bitti</option>
          </select>
        </div>

        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium text-tertiary mb-2">
            Tür
          </label>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full bg-black/50 border border-white/20 rounded-custom px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-all duration-200 cursor-pointer"
          >
            <option value="all">Tüm Türler</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  )
}

export default SearchFilter
