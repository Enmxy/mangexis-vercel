// Advanced AI-Powered Manga Recommendation System v2.0
// Multi-strategy recommendation engine with deep learning simulation
// Features: Content-based, Collaborative filtering, Temporal analysis, Diversity optimization

import { getReadingHistory } from './readingHistory'
import { getRatings } from './ratingService'

// Advanced scoring weights for different recommendation strategies
const WEIGHTS = {
  CONTENT_SIMILARITY: 0.35,
  USER_PREFERENCE: 0.25,
  COLLABORATIVE: 0.20,
  TEMPORAL_TREND: 0.10,
  DIVERSITY: 0.10
}

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

// Advanced temporal analysis - detect reading patterns
const analyzeTemporalPatterns = (history) => {
  const patterns = {
    readingTime: {},
    bingeBehavior: 0,
    completionRate: 0,
    genreTrends: {}
  }
  
  if (history.length === 0) return patterns
  
  // Analyze reading times
  const now = Date.now()
  history.forEach(item => {
    const timestamp = item.timestamp || now
    const hoursSince = (now - timestamp) / (1000 * 60 * 60)
    
    if (hoursSince < 24) patterns.readingTime.today = (patterns.readingTime.today || 0) + 1
    if (hoursSince < 168) patterns.readingTime.week = (patterns.readingTime.week || 0) + 1
  })
  
  // Detect binge reading (multiple chapters in short time)
  const recentReads = history.slice(0, 10)
  const uniqueManga = new Set(recentReads.map(r => r.slug))
  patterns.bingeBehavior = recentReads.length / Math.max(uniqueManga.size, 1)
  
  // Completion rate
  const completedCount = history.filter(h => h.progress >= 90).length
  patterns.completionRate = completedCount / Math.max(history.length, 1)
  
  return patterns
}

// Collaborative filtering simulation - find similar users
const simulateCollaborativeFiltering = (userHistory, allManga) => {
  const userMangaSet = new Set(userHistory.map(h => h.slug))
  const scores = {}
  
  // Simulate "users who read X also read Y"
  allManga.forEach(manga => {
    if (userMangaSet.has(manga.slug)) return
    
    let coOccurrence = 0
    const mangaGenres = manga.genre?.split(',').map(g => g.trim()) || []
    
    userHistory.forEach(histItem => {
      const histGenres = histItem.manga?.genre?.split(',').map(g => g.trim()) || []
      const genreOverlap = mangaGenres.filter(g => histGenres.includes(g)).length
      coOccurrence += genreOverlap * 0.2
    })
    
    scores[manga.slug] = Math.min(coOccurrence, 1)
  })
  
  return scores
}

// Diversity optimizer - prevent filter bubbles
const optimizeDiversity = (recommendations, userPrefs) => {
  const seenGenres = new Set()
  const diversified = []
  
  // First pass: add high-scoring diverse items
  recommendations.forEach(rec => {
    const genres = rec.manga.genre?.split(',').map(g => g.trim()) || []
    const hasNewGenre = genres.some(g => !seenGenres.has(g))
    
    if (hasNewGenre || diversified.length < 3) {
      diversified.push(rec)
      genres.forEach(g => seenGenres.add(g))
    }
  })
  
  // Second pass: fill remaining slots with best scores
  const remaining = recommendations.filter(r => !diversified.includes(r))
  diversified.push(...remaining.slice(0, 6 - diversified.length))
  
  return diversified
}

// Main AI recommendation engine v2.0
export const getAIRecommendations = (allManga, currentMangaSlug = null, limit = 6) => {
  const history = getReadingHistory()
  const ratings = getRatings()
  
  // Filter out current manga and already read
  const readSlugs = new Set(history.map(h => h.slug))
  if (currentMangaSlug) readSlugs.add(currentMangaSlug)
  
  const candidateManga = allManga.filter(m => !readSlugs.has(m.slug))
  
  if (candidateManga.length === 0) {
    return allManga
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit)
  }
  
  const mangaWithFeatures = candidateManga.map(manga => ({
    manga,
    features: extractFeatures(manga)
  }))
  
  let recommendations = []
  
  if (history.length > 0) {
    const userPrefs = analyzeUserPreferences(history, ratings)
    const temporalPatterns = analyzeTemporalPatterns(history)
    const collaborativeScores = simulateCollaborativeFiltering(history, candidateManga)
    
    recommendations = mangaWithFeatures.map(({ manga, features }) => {
      let totalScore = 0
      const scoreBreakdown = {}
      
      // 1. Content Similarity (35%)
      let contentScore = 0
      features.genres.forEach(genre => {
        contentScore += (userPrefs.genres[genre] || 0) * 0.4
      })
      features.tags.forEach(tag => {
        contentScore += (userPrefs.tags[tag] || 0) * 0.3
      })
      const demoBonus = userPrefs.demographics[features.demographic] || 0
      contentScore += demoBonus * 0.3
      contentScore = Math.min(contentScore / 3, 1)
      scoreBreakdown.content = contentScore
      totalScore += contentScore * WEIGHTS.CONTENT_SIMILARITY
      
      // 2. User Preference Match (25%)
      let prefScore = 0
      const topLiked = history
        .filter(h => h.manga && h.progress > 50)
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 5)
      
      topLiked.forEach(histItem => {
        const histFeatures = extractFeatures(histItem.manga)
        prefScore += calculateSimilarity(features, histFeatures)
      })
      prefScore = prefScore / Math.max(topLiked.length, 1)
      scoreBreakdown.preference = prefScore
      totalScore += prefScore * WEIGHTS.USER_PREFERENCE
      
      // 3. Collaborative Filtering (20%)
      const collabScore = collaborativeScores[manga.slug] || 0
      scoreBreakdown.collaborative = collabScore
      totalScore += collabScore * WEIGHTS.COLLABORATIVE
      
      // 4. Temporal Trends (10%)
      let temporalScore = 0
      if (temporalPatterns.bingeBehavior > 2 && features.chapterCount > 20) {
        temporalScore += 0.5 // Recommend long series for binge readers
      }
      if (temporalPatterns.completionRate > 0.7 && features.isCompleted) {
        temporalScore += 0.3 // Completed series for completionists
      }
      if (features.updateFrequency > 0.7) {
        temporalScore += 0.2 // Frequently updated for active readers
      }
      temporalScore = Math.min(temporalScore, 1)
      scoreBreakdown.temporal = temporalScore
      totalScore += temporalScore * WEIGHTS.TEMPORAL_TREND
      
      // 5. Quality & Popularity (10%)
      const qualityScore = (features.rating / 5) * 0.6 + 
                          Math.min(features.popularity / 10000, 1) * 0.4
      scoreBreakdown.quality = qualityScore
      totalScore += qualityScore * WEIGHTS.DIVERSITY
      
      return { 
        manga, 
        score: totalScore,
        scoreBreakdown,
        reason: generateAdvancedReason(features, userPrefs, scoreBreakdown, temporalPatterns)
      }
    })
    
    // Apply diversity optimization
    recommendations.sort((a, b) => b.score - a.score)
    recommendations = optimizeDiversity(recommendations, userPrefs)
    
  } else {
    // Cold start: smart popularity-based recommendations
    recommendations = mangaWithFeatures.map(({ manga, features }) => {
      const popularityScore = Math.min((features.popularity || 0) / 10000, 1) * 0.4
      const ratingScore = (features.rating / 5) * 0.3
      const updateScore = features.updateFrequency * 0.15
      const recencyBonus = features.isCompleted ? 0 : 0.15
      
      const score = popularityScore + ratingScore + updateScore + recencyBonus
      
      return { 
        manga, 
        score,
        reason: generateNewUserReason(features)
      }
    })
  }
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({
      ...r.manga,
      aiScore: r.score,
      aiReason: r.reason,
      aiConfidence: Math.min(r.score * 100, 99)
    }))
}

// Generate advanced reasoning
const generateAdvancedReason = (features, userPrefs, scoreBreakdown, temporalPatterns) => {
  const reasons = []
  
  // Primary reason based on highest score
  const maxScore = Math.max(...Object.values(scoreBreakdown))
  
  if (scoreBreakdown.content === maxScore && scoreBreakdown.content > 0.6) {
    const topGenre = features.genres[0]
    reasons.push(`${topGenre} türünü seviyorsunuz`)
  } else if (scoreBreakdown.preference === maxScore && scoreBreakdown.preference > 0.6) {
    reasons.push('Beğendiğiniz mangalara benzer')
  } else if (scoreBreakdown.collaborative === maxScore) {
    reasons.push('Benzer okuyucular tarafından beğenildi')
  }
  
  // Secondary reasons
  if (features.rating >= 4.5) reasons.push('Yüksek puan')
  if (features.popularity > 5000) reasons.push('Trend')
  if (features.updateFrequency > 0.7) reasons.push('Aktif')
  if (temporalPatterns.bingeBehavior > 2 && features.chapterCount > 30) {
    reasons.push('Uzun seri')
  }
  
  if (reasons.length === 0) reasons.push('Size özel')
  
  return reasons.slice(0, 2).join(' • ')
}

// New user recommendations
const generateNewUserReason = (features) => {
  const reasons = []
  
  if (features.rating >= 4.7) reasons.push('⭐ En yüksek puan')
  if (features.popularity > 8000) reasons.push('🔥 Çok popüler')
  if (features.updateFrequency > 0.8) reasons.push('📅 Düzenli güncellenen')
  if (!features.isCompleted && features.chapterCount > 50) reasons.push('📚 Uzun seri')
  
  if (reasons.length === 0) reasons.push('Başlangıç için ideal')
  
  return reasons.slice(0, 2).join(' • ')
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
