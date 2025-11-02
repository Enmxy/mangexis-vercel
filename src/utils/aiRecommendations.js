// AI-Powered Manga Recommendation System
// Uses content-based filtering, collaborative filtering simulation, and behavioral analysis

import { getReadingHistory } from './readingHistory'
import { getRatings } from './ratingService'

// Content features for similarity calculation
const extractFeatures = (manga) => {
  const features = {
    genres: manga.genre?.split(',').map(g => g.trim()) || [],
    year: parseInt(manga.year) || 2020,
    popularity: manga.views || 0,
    rating: manga.rating || 4.0,
    chapterCount: manga.chapters?.length || 0,
    isCompleted: manga.status === 'Tamamlandı',
    updateFrequency: calculateUpdateFrequency(manga.chapters),
    tags: extractTags(manga),
    demographic: detectDemographic(manga)
  }
  return features
}

// Calculate how frequently manga updates
const calculateUpdateFrequency = (chapters) => {
  if (!chapters || chapters.length < 2) return 0
  
  const dates = chapters
    .filter(ch => ch.date)
    .map(ch => new Date(ch.date).getTime())
    .sort((a, b) => b - a)
  
  if (dates.length < 2) return 0
  
  const daysDiff = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24)
  const avgDaysBetween = daysDiff / (dates.length - 1)
  
  // Score: 1 = daily, 0.7 = weekly, 0.3 = monthly, 0.1 = rare
  if (avgDaysBetween <= 1) return 1
  if (avgDaysBetween <= 7) return 0.7
  if (avgDaysBetween <= 30) return 0.3
  return 0.1
}

// Extract tags from description using NLP-like approach
const extractTags = (manga) => {
  const tags = []
  const description = (manga.description || '').toLowerCase()
  
  // Keyword detection
  const keywords = {
    'aksiyon': ['dövüş', 'savaş', 'mücadele', 'güç'],
    'romantik': ['aşk', 'sevgi', 'romantik', 'kalp'],
    'komedi': ['komik', 'gül', 'eğlen', 'mizah'],
    'drama': ['dram', 'duygusal', 'gözyaş', 'hayat'],
    'fantezi': ['büyü', 'sihir', 'ejderha', 'peri'],
    'korku': ['korku', 'dehşet', 'karanlık', 'lanet'],
    'okul': ['okul', 'öğrenci', 'sınıf', 'lise'],
    'süper_güç': ['güç', 'yetenek', 'süper', 'hero'],
    'isekai': ['dünya', 'transfer', 'reenkarnasyon', 'yeniden doğ'],
    'oyun': ['oyun', 'game', 'level', 'skill']
  }
  
  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(word => description.includes(word))) {
      tags.push(tag)
    }
  }
  
  return tags
}

// Detect target demographic
const detectDemographic = (manga) => {
  const genres = manga.genre?.toLowerCase() || ''
  const desc = manga.description?.toLowerCase() || ''
  
  if (genres.includes('shounen') || desc.includes('shounen')) return 'shounen'
  if (genres.includes('seinen') || desc.includes('seinen')) return 'seinen'
  if (genres.includes('shoujo') || desc.includes('shoujo')) return 'shoujo'
  if (genres.includes('josei') || desc.includes('josei')) return 'josei'
  
  // Guess based on content
  if (genres.includes('aksiyon') || genres.includes('macera')) return 'shounen'
  if (genres.includes('romantik') && desc.includes('okul')) return 'shoujo'
  if (genres.includes('psikolojik') || genres.includes('gerilim')) return 'seinen'
  
  return 'general'
}

// Calculate similarity between two manga (0-1)
const calculateSimilarity = (manga1Features, manga2Features) => {
  let score = 0
  let weight = 0
  
  // Genre similarity (40% weight)
  const genreIntersection = manga1Features.genres.filter(g => 
    manga2Features.genres.includes(g)
  ).length
  const genreUnion = new Set([...manga1Features.genres, ...manga2Features.genres]).size
  const genreSimilarity = genreUnion > 0 ? genreIntersection / genreUnion : 0
  score += genreSimilarity * 0.4
  weight += 0.4
  
  // Tag similarity (20% weight)
  const tagIntersection = manga1Features.tags.filter(t => 
    manga2Features.tags.includes(t)
  ).length
  const tagUnion = new Set([...manga1Features.tags, ...manga2Features.tags]).size
  const tagSimilarity = tagUnion > 0 ? tagIntersection / tagUnion : 0
  score += tagSimilarity * 0.2
  weight += 0.2
  
  // Demographic match (15% weight)
  if (manga1Features.demographic === manga2Features.demographic) {
    score += 0.15
  }
  weight += 0.15
  
  // Year proximity (10% weight)
  const yearDiff = Math.abs(manga1Features.year - manga2Features.year)
  const yearSimilarity = Math.max(0, 1 - yearDiff / 10) // 10 years = 0 similarity
  score += yearSimilarity * 0.1
  weight += 0.1
  
  // Status similarity (5% weight)
  if (manga1Features.isCompleted === manga2Features.isCompleted) {
    score += 0.05
  }
  weight += 0.05
  
  // Rating similarity (10% weight)
  const ratingDiff = Math.abs(manga1Features.rating - manga2Features.rating)
  const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5) // 5 point scale
  score += ratingSimilarity * 0.1
  weight += 0.1
  
  return weight > 0 ? score / weight : 0
}

// User preference learning
const analyzeUserPreferences = (history, ratings) => {
  const preferences = {
    genres: {},
    tags: {},
    demographics: {},
    avgRating: 0,
    preferredUpdateFreq: 0,
    preferredLength: 0
  }
  
  let totalWeight = 0
  
  // Analyze reading history
  history.forEach(item => {
    const weight = item.progress || 1 // Higher progress = more interest
    const features = extractFeatures(item.manga)
    
    // Count genres
    features.genres.forEach(genre => {
      preferences.genres[genre] = (preferences.genres[genre] || 0) + weight
    })
    
    // Count tags
    features.tags.forEach(tag => {
      preferences.tags[tag] = (preferences.tags[tag] || 0) + weight
    })
    
    // Demographics
    preferences.demographics[features.demographic] = 
      (preferences.demographics[features.demographic] || 0) + weight
    
    preferences.preferredUpdateFreq += features.updateFrequency * weight
    preferences.preferredLength += features.chapterCount * weight
    
    totalWeight += weight
  })
  
  // Analyze ratings
  const userRatings = ratings || {}
  let ratingSum = 0
  let ratingCount = 0
  
  Object.entries(userRatings).forEach(([slug, data]) => {
    ratingSum += data.rating
    ratingCount++
  })
  
  preferences.avgRating = ratingCount > 0 ? ratingSum / ratingCount : 4.0
  
  // Normalize
  if (totalWeight > 0) {
    preferences.preferredUpdateFreq /= totalWeight
    preferences.preferredLength /= totalWeight
  }
  
  return preferences
}

// Main AI recommendation engine
export const getAIRecommendations = (allManga, currentMangaSlug = null, limit = 6) => {
  // Get user data
  const history = getReadingHistory()
  const ratings = getRatings()
  
  // Filter out current manga and already read
  const readSlugs = new Set(history.map(h => h.slug))
  if (currentMangaSlug) readSlugs.add(currentMangaSlug)
  
  const candidateManga = allManga.filter(m => !readSlugs.has(m.slug))
  
  if (candidateManga.length === 0) {
    // If user has read everything, recommend popular ones
    return allManga
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit)
  }
  
  // Extract features for all manga
  const mangaWithFeatures = candidateManga.map(manga => ({
    manga,
    features: extractFeatures(manga)
  }))
  
  // Calculate recommendations based on different strategies
  let recommendations = []
  
  if (history.length > 0) {
    // Content-based filtering
    const userPrefs = analyzeUserPreferences(history, ratings)
    
    recommendations = mangaWithFeatures.map(({ manga, features }) => {
      let score = 0
      
      // Genre preference score (30%)
      let genreScore = 0
      features.genres.forEach(genre => {
        genreScore += userPrefs.genres[genre] || 0
      })
      genreScore = genreScore / Math.max(features.genres.length, 1)
      score += genreScore * 0.3
      
      // Tag preference score (20%)
      let tagScore = 0
      features.tags.forEach(tag => {
        tagScore += userPrefs.tags[tag] || 0
      })
      tagScore = tagScore / Math.max(features.tags.length, 1)
      score += tagScore * 0.2
      
      // Demographic match (15%)
      const demoScore = userPrefs.demographics[features.demographic] || 0
      score += demoScore * 0.15
      
      // Similarity to liked manga (25%)
      let similarityScore = 0
      const topRatedHistory = history
        .filter(h => h.manga)
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 5)
      
      topRatedHistory.forEach(histItem => {
        const histFeatures = extractFeatures(histItem.manga)
        similarityScore += calculateSimilarity(features, histFeatures)
      })
      similarityScore = similarityScore / Math.max(topRatedHistory.length, 1)
      score += similarityScore * 0.25
      
      // Popularity boost for trending (10%)
      const popularityScore = Math.min(features.popularity / 10000, 1)
      score += popularityScore * 0.1
      
      // Add diversity factor
      const diversityNoise = Math.random() * 0.1 // 10% randomness
      score += diversityNoise
      
      return { manga, score, reason: generateReason(features, userPrefs, score) }
    })
  } else {
    // For new users: popularity-based with diversity
    recommendations = mangaWithFeatures.map(({ manga, features }) => {
      const popularityScore = Math.min((features.popularity || 0) / 10000, 1) * 0.5
      const ratingScore = (features.rating / 5) * 0.3
      const updateScore = features.updateFrequency * 0.1
      const diversityScore = Math.random() * 0.1
      
      const score = popularityScore + ratingScore + updateScore + diversityScore
      
      return { 
        manga, 
        score,
        reason: 'Popüler ve yüksek puanlı'
      }
    })
  }
  
  // Sort and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({
      ...r.manga,
      aiScore: r.score,
      aiReason: r.reason
    }))
}

// Generate human-readable reason for recommendation
const generateReason = (features, userPrefs, score) => {
  const reasons = []
  
  // Check genre match
  const topGenres = Object.entries(userPrefs.genres)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([g,]) => g)
  
  const matchedGenres = features.genres.filter(g => topGenres.includes(g))
  if (matchedGenres.length > 0) {
    reasons.push(`${matchedGenres[0]} severler için`)
  }
  
  // Check if highly rated
  if (features.rating >= 4.5) {
    reasons.push('Yüksek puanlı')
  }
  
  // Check if trending
  if (features.popularity > 5000) {
    reasons.push('Trend')
  }
  
  // Check update frequency
  if (features.updateFrequency > 0.7) {
    reasons.push('Düzenli güncellenen')
  }
  
  if (reasons.length === 0) {
    reasons.push('Size özel seçildi')
  }
  
  return reasons.slice(0, 2).join(' • ')
}

// Get personalized message
export const getPersonalizedMessage = () => {
  const history = getReadingHistory()
  const hour = new Date().getHours()
  
  let greeting = 'Merhaba'
  if (hour < 12) greeting = 'Günaydın'
  else if (hour < 18) greeting = 'İyi günler'
  else greeting = 'İyi akşamlar'
  
  if (history.length === 0) {
    return `${greeting}! Size özel manga önerileri hazırladık 🎯`
  }
  
  const lastRead = history[0]?.manga?.title
  if (lastRead) {
    return `${greeting}! "${lastRead}" okudunuz, bunları da sevebilirsiniz 🎯`
  }
  
  return `${greeting}! Okuma geçmişinize göre öneriler 🎯`
}
