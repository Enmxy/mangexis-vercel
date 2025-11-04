import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  saveUserProfile, 
  PROFILE_FRAMES, 
  isFrameUnlocked,
  getUnlockedFrames 
} from '../utils/userProfile'

const ProfileEditModal = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    username: profile.username || '',
    bio: profile.bio || '',
    frame: profile.frame || 'default'
  })
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar)
  const [bannerPreview, setBannerPreview] = useState(profile.banner)
  const [activeTab, setActiveTab] = useState('basic')
  const [saving, setSaving] = useState(false)
  
  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const handleImageUpload = (file, type) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result)
      } else {
        setBannerPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setSaving(true)
    
    const updatedProfile = saveUserProfile({
      ...profile,
      ...formData,
      avatar: avatarPreview,
      banner: bannerPreview
    })
    
    setTimeout(() => {
      setSaving(false)
      onSave(updatedProfile)
    }, 500)
  }

  const unlockedFrames = getUnlockedFrames(profile)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#1A1A1A] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#EDEDED]/20"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#EDEDED]/10">
            <div className="flex items-center justify-between">
              <h2 className="text-[#EDEDED] text-2xl font-black">Profili Düzenle</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#EDEDED]/10 rounded-lg transition-all"
              >
                <svg className="w-6 h-6 text-[#EDEDED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              {['basic', 'appearance', 'frames'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-3 font-bold text-sm transition-all relative ${
                    activeTab === tab
                      ? 'text-white'
                      : 'text-[#EDEDED]/60 hover:text-[#EDEDED]/80'
                  }`}
                >
                  {tab === 'basic' && 'Temel Bilgiler'}
                  {tab === 'appearance' && 'Görünüm'}
                  {tab === 'frames' && 'Çerçeveler'}
                  
                  {activeTab === tab && (
                    <motion.div
                      layoutId="editTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Display Name */}
                  <div>
                    <label className="block text-[#EDEDED] text-sm font-bold mb-2">
                      Görünen İsim
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#EDEDED]/10 text-[#EDEDED] rounded-lg border border-[#EDEDED]/20 focus:border-purple-600 focus:outline-none transition-all"
                      placeholder="Görünen isminiz"
                      maxLength={30}
                    />
                    <p className="text-[#EDEDED]/60 text-xs mt-1">{formData.displayName.length}/30</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[#EDEDED] text-sm font-bold mb-2">
                      Kullanıcı Adı
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EDEDED]/60">@</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full pl-8 pr-4 py-3 bg-[#EDEDED]/10 text-[#EDEDED] rounded-lg border border-[#EDEDED]/20 focus:border-purple-600 focus:outline-none transition-all"
                        placeholder="kullaniciadi"
                        maxLength={20}
                      />
                    </div>
                    <p className="text-[#EDEDED]/60 text-xs mt-1">Sadece harf, rakam ve alt çizgi</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-[#EDEDED] text-sm font-bold mb-2">
                      Biyografi
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-[#EDEDED]/10 text-[#EDEDED] rounded-lg border border-[#EDEDED]/20 focus:border-purple-600 focus:outline-none transition-all resize-none"
                      placeholder="Kendinizden bahsedin..."
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-[#EDEDED]/60 text-xs mt-1">{formData.bio.length}/200</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Avatar */}
                  <div>
                    <label className="block text-[#EDEDED] text-sm font-bold mb-3">
                      Profil Resmi
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#EDEDED]/10 border-2 border-[#EDEDED]/20">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                            <span className="text-white text-3xl font-black">
                              {formData.displayName[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
                          className="hidden"
                        />
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                        >
                          Resim Yükle
                        </button>
                        {avatarPreview && (
                          <button
                            onClick={() => setAvatarPreview(null)}
                            className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                          >
                            Kaldır
                          </button>
                        )}
                        <p className="text-[#EDEDED]/60 text-xs mt-2">JPG, PNG veya GIF (Max 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-[#EDEDED] text-sm font-bold mb-3">
                      Profil Banner
                    </label>
                    <div className="space-y-4">
                      <div className="relative w-full h-40 rounded-lg overflow-hidden bg-[#EDEDED]/10 border-2 border-[#EDEDED]/20">
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600" />
                        )}
                      </div>
                      <div>
                        <input
                          ref={bannerInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                          className="hidden"
                        />
                        <button
                          onClick={() => bannerInputRef.current?.click()}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                        >
                          Banner Yükle
                        </button>
                        {bannerPreview && (
                          <button
                            onClick={() => setBannerPreview(null)}
                            className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                          >
                            Kaldır
                          </button>
                        )}
                        <p className="text-[#EDEDED]/60 text-xs mt-2">Önerilen boyut: 1500x400px</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'frames' && (
                <motion.div
                  key="frames"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-4">
                    <h3 className="text-[#EDEDED] text-lg font-bold mb-2">Profil Çerçevesi</h3>
                    <p className="text-[#EDEDED]/60 text-sm">
                      Seviye atlayarak ve rozetler kazanarak yeni çerçeveler kilidini açın
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.values(PROFILE_FRAMES).map((frame) => {
                      const unlocked = isFrameUnlocked(frame.id, profile)
                      const isSelected = formData.frame === frame.id

                      return (
                        <motion.button
                          key={frame.id}
                          whileHover={{ scale: unlocked ? 1.05 : 1 }}
                          whileTap={{ scale: unlocked ? 0.95 : 1 }}
                          onClick={() => unlocked && setFormData({ ...formData, frame: frame.id })}
                          disabled={!unlocked}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600/20'
                              : unlocked
                              ? 'border-[#EDEDED]/20 bg-[#EDEDED]/5 hover:border-[#EDEDED]/40'
                              : 'border-[#EDEDED]/10 bg-[#EDEDED]/5 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {/* Frame Preview */}
                          <div className="relative w-20 h-20 mx-auto mb-3">
                            {frame.color && (
                              <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: frame.color,
                                  padding: '3px'
                                }}
                              >
                                <div className="w-full h-full rounded-full bg-[#1A1A1A]" />
                              </div>
                            )}
                            {!frame.color && (
                              <div className="w-full h-full rounded-full border-2 border-[#EDEDED]/20 bg-[#EDEDED]/10" />
                            )}
                          </div>

                          {/* Frame Info */}
                          <p className="text-[#EDEDED] text-sm font-bold text-center mb-1">
                            {frame.name}
                          </p>
                          {frame.requirement && (
                            <p className="text-[#EDEDED]/60 text-xs text-center">
                              {unlocked ? '✓ Kilidi Açıldı' : `🔒 ${frame.requirement}`}
                            </p>
                          )}

                          {/* Selected Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#EDEDED]/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#EDEDED]/10 text-[#EDEDED] rounded-lg font-bold hover:bg-[#EDEDED]/20 transition-all"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProfileEditModal
