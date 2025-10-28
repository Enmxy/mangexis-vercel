import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const MangaCard = ({ manga }) => {
  return (
    <Link to={`/manga/${manga.slug}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
        className="group cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-lg mb-3 aspect-[3/4]">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-custom ${
              manga.status === 'ongoing' 
                ? 'bg-white/90 text-black' 
                : 'bg-black/90 text-white border border-white/30'
            }`}>
              {manga.status === 'ongoing' ? 'Devam Ediyor' : 'Bitti'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1 group-hover:text-shadow-glow transition-all duration-200">
            {manga.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {manga.genres.slice(0, 3).map((genre) => (
              <span 
                key={genre} 
                className="text-xs text-tertiary"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default MangaCard
