// Rating Service - LocalStorage based manga ratings

const STORAGE_KEY = 'manga_ratings'

export const getRatings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error reading ratings:', error)
    return {}
  }
}

export const getMangaRating = (slug) => {
  const ratings = getRatings()
  return ratings[slug] || null
}

export const setMangaRating = (slug, rating) => {
  try {
    const ratings = getRatings()
    ratings[slug] = {
      rating: rating,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
    return true
  } catch (error) {
    console.error('Error saving rating:', error)
    return false
  }
}

export const getAverageRating = (slug) => {
  // Simüle edilmiş ortalama rating (gerçek backend olsaydı API'den gelirdi)
  const userRating = getMangaRating(slug)
  if (userRating) {
    return {
      average: userRating.rating,
      count: 1,
      userRating: userRating.rating
    }
  }
  return {
    average: 4.5,
    count: 0,
    userRating: null
  }
}
