import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getCurrentUserProfile, 
  getUserByUsername, 
  PROFILE_FRAMES,
  isFrameUnlocked,
  BADGES 
} from '../utils/userProfile'
import { getReadingHistory } from '../utils/readingHistory'
import { getRatings } from '../utils/ratingService'
import ProfileEditModal from '../components/ProfileEditModal'

const UserProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [readingHistory, setReadingHistory] = useState([])
  const [ratings, setRatings] = useState({})
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = () => {
    setLoading(true)
    
    if (username) {
      // View another user's profile
      const userProfile = getUserByUsername(username)
      if (userProfile) {
        setProfile(userProfile)
        setIsOwnProfile(false)
      } else {
        navigate('/404')
      }
    } else {
      // View own profile
      const currentProfile = getCurrentUserProfile()
      if (currentProfile) {
        setProfile(currentProfile)
        setIsOwnProfile(true)
        setReadingHistory(getReadingHistory())
        setRatings(getRatings())
      } else {
        // Redirect to login/setup
        navigate('/profile/setup')
      }
    }
    
    setLoading(false)
  }

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile)
    setShowEditModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#EDEDED]/20 border-t-[#EDEDED] rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#EDEDED] text-xl mb-4">Profil bulunamadı</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] rounded-lg font-bold hover:bg-white transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  const currentFrame = PROFILE_FRAMES[profile.frame] || PROFILE_FRAMES.default
  const xpProgress = (profile.xp % 100) / 100 * 100

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {profile.banner ? (
          <img
            src={profile.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
        
        {/* Edit Button */}
        {isOwnProfile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEditModal(true)}
            className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg font-medium hover:bg-white/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Profili Düzenle
          </motion.button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Avatar with Frame */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {/* Frame */}
              {currentFrame.color && (
                <div
                  className="absolute inset-0 rounded-full p-1"
                  style={{
                    background: currentFrame.color,
                    transform: 'scale(1.1)'
                  }}
                />
              )}
              
              {/* Avatar */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#0A0A0A] bg-[#EDEDED]/10">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                    <span className="text-white text-4xl md:text-5xl font-black">
                      {profile.displayName[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Level Badge */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-[#0A0A0A] shadow-lg">
                <span className="text-white text-sm font-black">Lv.{profile.level}</span>
              </div>
            </motion.div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="bg-[#EDEDED]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#EDEDED]/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-[#EDEDED] text-3xl md:text-4xl font-black mb-2">
                    {profile.displayName}
                  </h1>
                  <p className="text-[#EDEDED]/60 text-sm">@{profile.username}</p>
                </div>
                
                {/* Frame Name */}
                <div className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-[#EDEDED]/20">
                  <p className="text-[#EDEDED] text-xs font-bold">{currentFrame.name}</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-[#EDEDED]/80 text-sm md:text-base mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* XP Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#EDEDED]/60 text-xs">XP İlerlemesi</span>
                  <span className="text-[#EDEDED] text-xs font-bold">{profile.xp} XP</span>
                </div>
                <div className="w-full h-3 bg-[#EDEDED]/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-[#EDEDED]/5 rounded-lg">
                  <p className="text-2xl font-black text-white mb-1">{profile.stats.totalRead}</p>
                  <p className="text-[#EDEDED]/60 text-xs">Manga</p>
                </div>
                <div className="text-center p-3 bg-[#EDEDED]/5 rounded-lg">
                  <p className="text-2xl font-black text-white mb-1">{profile.stats.totalChapters}</p>
                  <p className="text-[#EDEDED]/60 text-xs">Bölüm</p>
                </div>
                <div className="text-center p-3 bg-[#EDEDED]/5 rounded-lg">
                  <p className="text-2xl font-black text-white mb-1">{profile.stats.readingStreak}</p>
                  <p className="text-[#EDEDED]/60 text-xs">🔥 Seri</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-[#EDEDED]/10">
          <div className="flex gap-6">
            {['overview', 'badges', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-bold text-sm transition-all relative ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-[#EDEDED]/60 hover:text-[#EDEDED]/80'
                }`}
              >
                {tab === 'overview' && 'Genel Bakış'}
                {tab === 'badges' && 'Rozetler'}
                {tab === 'stats' && 'İstatistikler'}
                
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Recent Activity */}
                {isOwnProfile && readingHistory.length > 0 && (
                  <div className="bg-[#EDEDED]/5 rounded-2xl p-6 border border-[#EDEDED]/10">
                    <h3 className="text-[#EDEDED] text-xl font-bold mb-4">Son Okunanlar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {readingHistory.slice(0, 4).map((item, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/manga/${item.slug}`)}
                        >
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                            <p className="text-white text-sm font-bold line-clamp-2">{item.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Genres */}
                {profile.stats.favoriteGenres.length > 0 && (
                  <div className="bg-[#EDEDED]/5 rounded-2xl p-6 border border-[#EDEDED]/10">
                    <h3 className="text-[#EDEDED] text-xl font-bold mb-4">Favori Türler</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.stats.favoriteGenres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-[#EDEDED] rounded-full text-sm font-medium border border-[#EDEDED]/20"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-[#EDEDED]/5 rounded-2xl p-6 border border-[#EDEDED]/10">
                  <h3 className="text-[#EDEDED] text-xl font-bold mb-6">Rozetler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.values(BADGES).map((badge) => {
                      const hasBadge = profile.badges.includes(badge.id)
                      return (
                        <motion.div
                          key={badge.id}
                          whileHover={{ scale: hasBadge ? 1.05 : 1 }}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            hasBadge
                              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                              : 'bg-[#EDEDED]/5 border-[#EDEDED]/10 opacity-40'
                          }`}
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <p className="text-[#EDEDED] text-sm font-bold mb-1">{badge.name}</p>
                          <p className="text-[#EDEDED]/60 text-xs">{badge.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Detailed Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#EDEDED]/5 rounded-2xl p-6 border border-[#EDEDED]/10">
                    <h3 className="text-[#EDEDED] text-lg font-bold mb-4">Okuma İstatistikleri</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Toplam Manga</span>
                        <span className="text-white font-bold">{profile.stats.totalRead}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Toplam Bölüm</span>
                        <span className="text-white font-bold">{profile.stats.totalChapters}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Okuma Serisi</span>
                        <span className="text-white font-bold">{profile.stats.readingStreak} gün</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Üyelik Süresi</span>
                        <span className="text-white font-bold">
                          {Math.floor((Date.now() - profile.stats.joinDate) / (1000 * 60 * 60 * 24))} gün
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#EDEDED]/5 rounded-2xl p-6 border border-[#EDEDED]/10">
                    <h3 className="text-[#EDEDED] text-lg font-bold mb-4">Seviye İlerlemesi</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Mevcut Seviye</span>
                        <span className="text-white font-bold">Level {profile.level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Toplam XP</span>
                        <span className="text-white font-bold">{profile.xp} XP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Sonraki Seviye</span>
                        <span className="text-white font-bold">{100 - (profile.xp % 100)} XP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]/70">Rozetler</span>
                        <span className="text-white font-bold">{profile.badges.length}/{Object.keys(BADGES).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default UserProfile
