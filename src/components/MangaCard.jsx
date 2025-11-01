import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { useUser } from '@clerk/clerk-react'

const MangaCard = ({ manga }) => {
  const { toggleFavorite, isFavorite, loading } = useFavorites()
  const { isSignedIn } = useUser()
  const favorite = isFavorite(manga.slug)

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isSignedIn) {
      alert('❤️ Favorilere eklemek için giriş yapmalısınız!')
      return
    }
    
    toggleFavorite(manga.slug)
  }

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

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-3 left-3 p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-all group/fav"
            title={favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <svg 
              className={`w-5 h-5 transition-all ${
                favorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'fill-none text-white group-hover/fav:text-red-500'
              }`} 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.button>
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
