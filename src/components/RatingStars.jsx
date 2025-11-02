import { useState } from 'react'
import { motion } from 'framer-motion'
import { getMangaRating, setMangaRating } from '../utils/ratingService'

const RatingStars = ({ slug, size = 'md', showCount = false }) => {
  const savedRating = getMangaRating(slug)
  const [rating, setRating] = useState(savedRating?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showToast, setShowToast] = useState(false)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const handleRate = (value) => {
    setRating(value)
    setMangaRating(slug, value)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRate(star)}
            className="focus:outline-none transition-all"
          >
            <svg
              className={`${sizes[size]} transition-colors ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/30 fill-none'
              }`}
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </motion.button>
        ))}
        {rating > 0 && (
          <span className="text-white text-sm font-medium ml-2">
            {rating}.0
          </span>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 mt-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
        >
          ⭐ {rating} yıldız verdiniz!
        </motion.div>
      )}
    </div>
  )
}

export default RatingStars
