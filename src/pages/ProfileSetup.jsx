import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { initializeUserProfile, isUsernameAvailable } from '../utils/userProfile'

const ProfileSetup = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.username) {
      newErrors.username = 'Kullanıcı adı gerekli'
    } else if (formData.username.length < 3) {
      newErrors.username = 'En az 3 karakter olmalı'
    } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Sadece küçük harf, rakam ve alt çizgi'
    } else if (!isUsernameAvailable(formData.username)) {
      newErrors.username = 'Bu kullanıcı adı alınmış'
    }
    
    if (!formData.displayName) {
      newErrors.displayName = 'Görünen isim gerekli'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleComplete = () => {
    setLoading(true)
    
    const profile = initializeUserProfile(formData.username)
    const updatedProfile = {
      ...profile,
      displayName: formData.displayName,
      bio: formData.bio
    }
    
    // Save updated profile
    localStorage.setItem('mangexis_user_profile', JSON.stringify(updatedProfile))
    
    setTimeout(() => {
      navigate('/profile')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6"
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
          <h1 className="text-[#EDEDED] text-4xl font-black mb-3">
            Profilini Oluştur
          </h1>
          <p className="text-[#EDEDED]/70 text-lg">
            MangeXis topluluğuna hoş geldin! 🎉
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#EDEDED]/60 text-sm">Adım {step}/2</span>
            <span className="text-[#EDEDED]/60 text-sm">{step === 1 ? 'Temel Bilgiler' : 'Biyografi'}</span>
          </div>
          <div className="w-full h-2 bg-[#EDEDED]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 2) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#EDEDED]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#EDEDED]/10">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Username */}
              <div>
                <label className="block text-[#EDEDED] text-sm font-bold mb-2">
                  Kullanıcı Adı *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EDEDED]/60 text-lg">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                      setFormData({ ...formData, username: value })
                      setErrors({ ...errors, username: '' })
                    }}
                    className={`w-full pl-10 pr-4 py-4 bg-[#EDEDED]/10 text-[#EDEDED] text-lg rounded-xl border-2 ${
                      errors.username ? 'border-red-500' : 'border-[#EDEDED]/20'
                    } focus:border-purple-600 focus:outline-none transition-all`}
                    placeholder="kullaniciadi"
                    maxLength={20}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm mt-2">{errors.username}</p>
                )}
                <p className="text-[#EDEDED]/60 text-xs mt-2">
                  Bu adınız herkese görünür olacak. Sonradan değiştiremezsiniz.
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-[#EDEDED] text-sm font-bold mb-2">
                  Görünen İsim *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => {
                    setFormData({ ...formData, displayName: e.target.value })
                    setErrors({ ...errors, displayName: '' })
                  }}
                  className={`w-full px-4 py-4 bg-[#EDEDED]/10 text-[#EDEDED] text-lg rounded-xl border-2 ${
                    errors.displayName ? 'border-red-500' : 'border-[#EDEDED]/20'
                  } focus:border-purple-600 focus:outline-none transition-all`}
                  placeholder="Adınız Soyadınız"
                  maxLength={30}
                />
                {errors.displayName && (
                  <p className="text-red-500 text-sm mt-2">{errors.displayName}</p>
                )}
                <p className="text-[#EDEDED]/60 text-xs mt-2">
                  Profilinizde görünecek isim. İstediğiniz zaman değiştirebilirsiniz.
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Bio */}
              <div>
                <label className="block text-[#EDEDED] text-sm font-bold mb-2">
                  Biyografi (Opsiyonel)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-4 bg-[#EDEDED]/10 text-[#EDEDED] text-lg rounded-xl border-2 border-[#EDEDED]/20 focus:border-purple-600 focus:outline-none transition-all resize-none"
                  placeholder="Kendinizden bahsedin... Favori manga türleriniz, okuma alışkanlıklarınız vb."
                  rows={6}
                  maxLength={200}
                />
                <p className="text-[#EDEDED]/60 text-xs mt-2">
                  {formData.bio.length}/200 karakter
                </p>
              </div>

              {/* Preview */}
              <div className="p-6 bg-[#EDEDED]/5 rounded-xl border border-[#EDEDED]/10">
                <p className="text-[#EDEDED]/60 text-sm mb-3">Önizleme:</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-black">
                      {formData.displayName[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[#EDEDED] text-lg font-bold">{formData.displayName || 'Görünen İsim'}</h3>
                    <p className="text-[#EDEDED]/60 text-sm">@{formData.username || 'kullaniciadi'}</p>
                    {formData.bio && (
                      <p className="text-[#EDEDED]/80 text-sm mt-2">{formData.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-[#EDEDED]/10 text-[#EDEDED] rounded-xl font-bold hover:bg-[#EDEDED]/20 transition-all"
              >
                ← Geri
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all"
              >
                İleri →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  '✓ Tamamla'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-[#EDEDED]/60 hover:text-[#EDEDED] text-sm transition-all"
          >
            Şimdilik Atla →
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfileSetup
