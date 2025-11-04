// User Profile Management System
// Handles user profiles, avatars, banners, frames, and bio

const STORAGE_KEY = 'mangexis_user_profile'
const USERS_KEY = 'mangexis_all_users'

// Default profile structure
const createDefaultProfile = (username) => ({
  id: generateUserId(),
  username: username || 'Kullanıcı',
  displayName: username || 'Kullanıcı',
  bio: '',
  avatar: null,
  banner: null,
  frame: 'default',
  level: 1,
  xp: 0,
  badges: [],
  stats: {
    totalRead: 0,
    totalChapters: 0,
    favoriteGenres: [],
    readingStreak: 0,
    joinDate: Date.now()
  },
  settings: {
    profilePublic: true,
    showStats: true,
    showReadingHistory: false
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
})

// Generate unique user ID
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get current user profile
export const getCurrentUserProfile = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch (error) {
    console.error('Error loading user profile:', error)
    return null
  }
}

// Create or update user profile
export const saveUserProfile = (profileData) => {
  try {
    const currentProfile = getCurrentUserProfile()
    const updatedProfile = {
      ...(currentProfile || createDefaultProfile(profileData.username)),
      ...profileData,
      updatedAt: Date.now()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile))
    
    // Also save to all users list
    saveToUsersList(updatedProfile)
    
    return updatedProfile
  } catch (error) {
    console.error('Error saving user profile:', error)
    return null
  }
}

// Initialize user profile (first time)
export const initializeUserProfile = (username) => {
  const existing = getCurrentUserProfile()
  if (existing) return existing
  
  const newProfile = createDefaultProfile(username)
  return saveUserProfile(newProfile)
}

// Update specific profile fields
export const updateProfileField = (field, value) => {
  const profile = getCurrentUserProfile()
  if (!profile) return null
  
  return saveUserProfile({
    ...profile,
    [field]: value
  })
}

// Update profile stats
export const updateProfileStats = (stats) => {
  const profile = getCurrentUserProfile()
  if (!profile) return null
  
  return saveUserProfile({
    ...profile,
    stats: {
      ...profile.stats,
      ...stats
    }
  })
}

// Add XP and level up
export const addXP = (amount) => {
  const profile = getCurrentUserProfile()
  if (!profile) return null
  
  const newXP = profile.xp + amount
  const newLevel = calculateLevel(newXP)
  
  return saveUserProfile({
    ...profile,
    xp: newXP,
    level: newLevel
  })
}

// Calculate level from XP
const calculateLevel = (xp) => {
  // 100 XP per level, exponential growth
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

// Get XP needed for next level
export const getXPForNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP)
  const nextLevelXP = Math.pow(currentLevel, 2) * 100
  return nextLevelXP - currentXP
}

// Add badge to profile
export const addBadge = (badge) => {
  const profile = getCurrentUserProfile()
  if (!profile) return null
  
  if (!profile.badges.includes(badge)) {
    return saveUserProfile({
      ...profile,
      badges: [...profile.badges, badge]
    })
  }
  
  return profile
}

// Available profile frames
export const PROFILE_FRAMES = {
  default: {
    id: 'default',
    name: 'Varsayılan',
    image: null,
    unlocked: true,
    requirement: null
  },
  bronze: {
    id: 'bronze',
    name: 'Bronz Çerçeve',
    color: 'linear-gradient(135deg, #CD7F32, #B87333)',
    unlocked: false,
    requirement: 'Level 5'
  },
  silver: {
    id: 'silver',
    name: 'Gümüş Çerçeve',
    color: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
    unlocked: false,
    requirement: 'Level 10'
  },
  gold: {
    id: 'gold',
    name: 'Altın Çerçeve',
    color: 'linear-gradient(135deg, #FFD700, #FFA500)',
    unlocked: false,
    requirement: 'Level 20'
  },
  platinum: {
    id: 'platinum',
    name: 'Platin Çerçeve',
    color: 'linear-gradient(135deg, #E5E4E2, #D3D3D3)',
    unlocked: false,
    requirement: 'Level 30'
  },
  diamond: {
    id: 'diamond',
    name: 'Elmas Çerçeve',
    color: 'linear-gradient(135deg, #B9F2FF, #00CED1)',
    unlocked: false,
    requirement: 'Level 50'
  },
  rainbow: {
    id: 'rainbow',
    name: 'Gökkuşağı Çerçeve',
    color: 'linear-gradient(135deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)',
    unlocked: false,
    requirement: 'Level 75'
  },
  cosmic: {
    id: 'cosmic',
    name: 'Kozmik Çerçeve',
    color: 'linear-gradient(135deg, #1e3a8a, #7c3aed, #ec4899)',
    unlocked: false,
    requirement: 'Level 100'
  },
  manga_master: {
    id: 'manga_master',
    name: 'Manga Ustası',
    color: 'linear-gradient(135deg, #000000, #FF0000, #000000)',
    unlocked: false,
    requirement: '500 Bölüm Oku'
  },
  speed_reader: {
    id: 'speed_reader',
    name: 'Hızlı Okuyucu',
    color: 'linear-gradient(135deg, #10b981, #3b82f6)',
    unlocked: false,
    requirement: '30 Günlük Seri'
  }
}

// Check if frame is unlocked
export const isFrameUnlocked = (frameId, profile) => {
  if (!profile) return false
  
  const frame = PROFILE_FRAMES[frameId]
  if (!frame) return false
  if (frame.unlocked) return true
  
  // Check level requirements
  if (frameId === 'bronze' && profile.level >= 5) return true
  if (frameId === 'silver' && profile.level >= 10) return true
  if (frameId === 'gold' && profile.level >= 20) return true
  if (frameId === 'platinum' && profile.level >= 30) return true
  if (frameId === 'diamond' && profile.level >= 50) return true
  if (frameId === 'rainbow' && profile.level >= 75) return true
  if (frameId === 'cosmic' && profile.level >= 100) return true
  
  // Check achievement requirements
  if (frameId === 'manga_master' && profile.stats.totalChapters >= 500) return true
  if (frameId === 'speed_reader' && profile.stats.readingStreak >= 30) return true
  
  return false
}

// Get all unlocked frames for user
export const getUnlockedFrames = (profile) => {
  if (!profile) return [PROFILE_FRAMES.default]
  
  return Object.values(PROFILE_FRAMES).filter(frame => 
    isFrameUnlocked(frame.id, profile)
  )
}

// Save to all users list (for public profiles)
const saveToUsersList = (profile) => {
  try {
    const allUsers = getAllUsers()
    const index = allUsers.findIndex(u => u.id === profile.id)
    
    if (index !== -1) {
      allUsers[index] = profile
    } else {
      allUsers.push(profile)
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers))
  } catch (error) {
    console.error('Error saving to users list:', error)
  }
}

// Get all users (for discovery)
export const getAllUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading users list:', error)
    return []
  }
}

// Get user by ID
export const getUserById = (userId) => {
  const users = getAllUsers()
  return users.find(u => u.id === userId)
}

// Get user by username
export const getUserByUsername = (username) => {
  const users = getAllUsers()
  return users.find(u => u.username.toLowerCase() === username.toLowerCase())
}

// Search users
export const searchUsers = (query) => {
  const users = getAllUsers()
  const lowerQuery = query.toLowerCase()
  
  return users.filter(u => 
    u.username.toLowerCase().includes(lowerQuery) ||
    u.displayName.toLowerCase().includes(lowerQuery)
  )
}

// Check if username is available
export const isUsernameAvailable = (username) => {
  const currentUser = getCurrentUserProfile()
  const existingUser = getUserByUsername(username)
  
  if (!existingUser) return true
  if (currentUser && existingUser.id === currentUser.id) return true
  
  return false
}

// Available badges
export const BADGES = {
  first_read: { id: 'first_read', name: 'İlk Okuma', icon: '📖', description: 'İlk mangayı oku' },
  chapter_10: { id: 'chapter_10', name: '10 Bölüm', icon: '🔟', description: '10 bölüm oku' },
  chapter_50: { id: 'chapter_50', name: '50 Bölüm', icon: '🎯', description: '50 bölüm oku' },
  chapter_100: { id: 'chapter_100', name: '100 Bölüm', icon: '💯', description: '100 bölüm oku' },
  chapter_500: { id: 'chapter_500', name: '500 Bölüm', icon: '🏆', description: '500 bölüm oku' },
  streak_7: { id: 'streak_7', name: '7 Günlük Seri', icon: '🔥', description: '7 gün üst üste oku' },
  streak_30: { id: 'streak_30', name: '30 Günlük Seri', icon: '⚡', description: '30 gün üst üste oku' },
  early_bird: { id: 'early_bird', name: 'Erken Kuş', icon: '🌅', description: 'Sabah 6-9 arası oku' },
  night_owl: { id: 'night_owl', name: 'Gece Kuşu', icon: '🦉', description: 'Gece 12-3 arası oku' },
  completionist: { id: 'completionist', name: 'Tamamlayıcı', icon: '✅', description: '10 mangayı bitir' },
  reviewer: { id: 'reviewer', name: 'Eleştirmen', icon: '⭐', description: '10 manga puanla' },
  explorer: { id: 'explorer', name: 'Kaşif', icon: '🗺️', description: '5 farklı tür oku' }
}
