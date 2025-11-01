import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllMangas } from '../../utils/mangaService'

const ChapterAdd = () => {
  const navigate = useNavigate()
  const [mangas, setMangas] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [imageCount, setImageCount] = useState(0)
  const [formData, setFormData] = useState({
    mangaSlug: '',
    chapterNumber: '',
    chapterTitle: '',
    fansubName: '',
    images: ''
  })

  useEffect(() => {
    loadMangas()
  }, [])

  const loadMangas = async () => {
    try {
      const data = await getAllMangas()
      setMangas(data)
    } catch (error) {
      console.error('Error loading mangas:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Real-time validation
    validateField(name, value)
    
    // Count images
    if (name === 'images') {
      const count = value.split(/[,\n]/).filter(url => url.trim().length > 0).length
      setImageCount(count)
    }
    
    // Auto-advance steps
    if (name === 'mangaSlug' && value && currentStep === 1) setCurrentStep(2)
    if (name === 'chapterNumber' && value && currentStep === 2) setCurrentStep(3)
    if (name === 'fansubName' && value && currentStep === 3) setCurrentStep(4)
  }
  
  const validateField = (name, value) => {
    const errors = { ...validationErrors }
    
    switch(name) {
      case 'mangaSlug':
        if (!value) errors.mangaSlug = 'Manga seçimi zorunludur'
        else delete errors.mangaSlug
        break
      case 'chapterNumber':
        if (!value) errors.chapterNumber = 'Bölüm numarası zorunludur'
        else if (value < 1) errors.chapterNumber = 'Bölüm numarası 1 veya daha büyük olmalı'
        else delete errors.chapterNumber
        break
      case 'fansubName':
        if (!value) errors.fansubName = 'Fansub adı zorunludur'
        else if (value.length < 3) errors.fansubName = 'Fansub adı en az 3 karakter olmalı'
        else delete errors.fansubName
        break
      case 'images':
        const urls = value.split(/[,\n]/).filter(url => url.trim().length > 0)
        if (urls.length === 0) errors.images = 'En az 1 resim URL\'si gerekli'
        else if (urls.some(url => !url.match(/^https?:\/\/.+/))) {
          errors.images = 'Tüm URL\'ler http:// veya https:// ile başlamalı'
        }
        else delete errors.images
        break
    }
    
    setValidationErrors(errors)
  }
  
  const fillExampleData = () => {
    setFormData({
      mangaSlug: mangas[0]?.slug || '',
      chapterNumber: '1',
      chapterTitle: 'Başlangıç',
      fansubName: 'MangeXis Fansub',
      images: 'https://example.com/page1.jpg\nhttps://example.com/page2.jpg\nhttps://example.com/page3.jpg'
    })
    setImageCount(3)
    setCurrentStep(4)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.mangaSlug || !formData.chapterNumber || !formData.fansubName || !formData.images) {
      alert('⚠️ Lütfen tüm zorunlu alanları doldurun!')
      return
    }

    setLoading(true)

    try {
      // Parse images (comma or newline separated URLs)
      const imageLinks = formData.images
        .split(/[,\n]/)
        .map(url => url.trim())
        .filter(url => url.length > 0)

      if (imageLinks.length === 0) {
        alert('⚠️ En az 1 resim URL\'si gerekli!')
        setLoading(false)
        return
      }

      const chapterData = {
        id: formData.chapterNumber,
        title: formData.chapterTitle || `Bölüm ${formData.chapterNumber}`,
        imageLinks,
        fansubs: [
          {
            name: formData.fansubName,
            images: imageLinks
          }
        ]
      }

      // Get auth token
      const token = localStorage.getItem('admin_token')
      if (!token) {
        alert('❌ Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        navigate('/admin/login')
        return
      }

      // Call API to add chapter
      const response = await fetch('/api/manga-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          operation: 'ADD_CHAPTER',
          slug: formData.mangaSlug,
          chapter: chapterData
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Bölüm başarıyla eklendi!')
        setFormData({
          mangaSlug: formData.mangaSlug,
          chapterNumber: '',
          chapterTitle: '',
          fansubName: formData.fansubName,
          images: ''
        })
      } else {
        alert('❌ Hata: ' + (result.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('❌ Bir hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Help Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Yeni Bölüm Ekle</h1>
          <p className="text-gray-400 text-sm mt-1">Manga'ya yeni bölüm ekleyin</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTutorial(!showTutorial)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {showTutorial ? 'Rehberi Gizle' : 'Rehber'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHelpModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Yardım
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fillExampleData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Örnek Doldur
          </motion.button>
        </div>
      </div>
      
      {/* Tutorial Steps Indicator */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-white font-bold text-lg">Adım Adım Rehber</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { 
                  num: 1, 
                  title: 'Manga Seç', 
                  desc: 'Bölüm ekleyeceğiniz manga\'yı seçin',
                  icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                },
                { 
                  num: 2, 
                  title: 'Bölüm No', 
                  desc: 'Bölüm numarasını girin',
                  icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                },
                { 
                  num: 3, 
                  title: 'Fansub Adı', 
                  desc: 'Fansub grubunuzun adını yazın',
                  icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                },
                { 
                  num: 4, 
                  title: 'Resimleri Ekle', 
                  desc: 'Bölüm sayfalarının URL\'lerini ekleyin',
                  icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              ].map((step) => (
                <div
                  key={step.num}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    currentStep === step.num
                      ? 'bg-white/10 border-white shadow-lg scale-105'
                      : currentStep > step.num
                      ? 'bg-green-900/20 border-green-500/50'
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      currentStep === step.num
                        ? 'bg-white text-purple-900'
                        : currentStep > step.num
                        ? 'bg-green-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}>
                      {currentStep > step.num ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.num
                      )}
                    </div>
                    <div className="text-white">{step.icon}</div>
                  </div>
                  <h4 className="text-white font-semibold mb-1">{step.title}</h4>
                  <p className="text-gray-300 text-xs">{step.desc}</p>
                  {currentStep === step.num && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ŞİMDİ
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manga Selection */}
        <motion.div 
          className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
            currentStep === 1 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
          }`}
          animate={currentStep === 1 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Manga Seçin <span className="text-red-500">*</span></span>
            </label>
            {currentStep === 1 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                1. ADIM
              </span>
            )}
          </div>
          <select
            name="mangaSlug"
            value={formData.mangaSlug}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            required
          >
            <option value="">Bir manga seçin...</option>
            {mangas.map(manga => (
              <option key={manga.slug} value={manga.slug}>
                {manga.title}
              </option>
            ))}
          </select>
          {validationErrors.mangaSlug && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.mangaSlug}
            </p>
          )}
          {formData.mangaSlug && (
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Harika! Manga seçildi.
            </p>
          )}
          <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bölüm eklemek istediğiniz manga'yı listeden seçin
          </p>
        </motion.div>

        {/* Chapter Number */}
        <motion.div 
          className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
            currentStep === 2 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
          }`}
          animate={currentStep === 2 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span>Bölüm Numarası <span className="text-red-500">*</span></span>
            </label>
            {currentStep === 2 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                2. ADIM
              </span>
            )}
          </div>
          <input
            type="number"
            name="chapterNumber"
            value={formData.chapterNumber}
            onChange={handleChange}
            placeholder="Örn: 1, 2, 3..."
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors text-lg font-semibold"
            required
          />
          {validationErrors.chapterNumber && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.chapterNumber}
            </p>
          )}
          {formData.chapterNumber && (
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mükemmel! Bölüm {formData.chapterNumber}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Her bölüm için benzersiz bir numara kullanın
          </p>
        </motion.div>

        {/* Chapter Title */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Bölüm Başlığı</span>
            </label>
            <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full">Opsiyonel</span>
          </div>
          <input
            type="text"
            name="chapterTitle"
            value={formData.chapterTitle}
            onChange={handleChange}
            placeholder="Örn: Başlangıç, Yeni Macera, Final Savaşı..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bölüme özel bir başlık eklemek isterseniz buraya yazın
          </p>
        </div>

        {/* Fansub Name */}
        <motion.div 
          className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
            currentStep === 3 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
          }`}
          animate={currentStep === 3 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Fansub Adı <span className="text-red-500">*</span></span>
            </label>
            {currentStep === 3 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                3. ADIM
              </span>
            )}
          </div>
          <input
            type="text"
            name="fansubName"
            value={formData.fansubName}
            onChange={handleChange}
            placeholder="Örn: MangeXis Fansub, Anime Türkiye..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            required
          />
          {validationErrors.fansubName && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.fansubName}
            </p>
          )}
          {formData.fansubName && (
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Harika! Fansub: {formData.fansubName}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Çeviri grubunuzun adını yazın
          </p>
        </motion.div>

        {/* Images */}
        <motion.div 
          className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
            currentStep === 4 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
          }`}
          animate={currentStep === 4 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Resim URL'leri <span className="text-red-500">*</span></span>
            </label>
            <div className="flex items-center gap-2">
              {currentStep === 4 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  4. ADIM
                </span>
              )}
              {imageCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {imageCount} sayfa
                </span>
              )}
            </div>
          </div>
          <textarea
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="Her satıra bir resim URL'si yazın:&#10;&#10;https://example.com/page1.jpg&#10;https://example.com/page2.jpg&#10;https://example.com/page3.jpg&#10;https://example.com/page4.jpg&#10;...&#10;&#10;veya vergülle ayırın: url1.jpg, url2.jpg, url3.jpg"
            rows={12}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono text-sm"
            required
          />
          {validationErrors.images && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.images}
            </p>
          )}
          {imageCount > 0 && !validationErrors.images && (
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mükemmel! {imageCount} sayfa eklendi.
            </p>
          )}
          <div className="mt-3 space-y-2">
            <p className="text-gray-400 text-xs flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <strong>İpuçları:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-400 text-xs space-y-1 ml-4">
              <li>Her satıra bir URL yazın (Enter ile ayırın)</li>
              <li>Veya vergülle (,) ayırarak ekleyin</li>
              <li>Sayfaları okuma sırasına göre ekleyin (1, 2, 3...)</li>
              <li>URL'ler http:// veya https:// ile başlamalı</li>
              <li>Yüksek kaliteli resimler kullanın</li>
            </ul>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ekleniyor...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Bölüm Ekle
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              İpuçları:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Resim URL'lerinin doğru ve erişilebilir olduğundan emin olun</li>
              <li>Sayfaları doğru sırada ekleyin (1, 2, 3...)</li>
              <li>Yüksek kaliteli resimler kullanın</li>
              <li>Bölüm numarası benzersiz olmalıdır</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHelpModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Bölüm Ekleme Rehberi</h2>
                    <p className="text-gray-400 text-sm">Adım adım talimatlar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-gradient-to-r from-purple-900/30 to-transparent border-l-4 border-purple-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">📚 Manga Seçin</h3>
                      <p className="text-gray-300 mb-3">Açılır listeden bölüm eklemek istediğiniz manga'yı seçin.</p>
                      <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                        <p className="text-gray-400 text-sm font-mono">
                          Örnek: "One Piece", "Naruto", "Attack on Titan"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="bg-gradient-to-r from-blue-900/30 to-transparent border-l-4 border-blue-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">🔢 Bölüm Numarası</h3>
                      <p className="text-gray-300 mb-3">Ekleyeceğiniz bölümün numarasını girin. Her bölüm için benzersiz bir numara kullanın.</p>
                      <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                        <p className="text-gray-400 text-sm font-mono">
                          Örnek: 1, 2, 3, 4, 5... (sadece sayı)
                        </p>
                      </div>
                      <div className="mt-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <strong>Dikkat:</strong> Aynı bölüm numarasını tekrar eklemeyin!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="bg-gradient-to-r from-green-900/30 to-transparent border-l-4 border-green-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">👥 Fansub Adınız</h3>
                      <p className="text-gray-300 mb-3">Çeviri grubunuzun adını yazın. Bu ad bölüm sayfasında görünecek.</p>
                      <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                        <p className="text-gray-400 text-sm font-mono">
                          Örnek: "MangeXis Fansub", "Anime Türkiye", "MangaTR"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="bg-gradient-to-r from-orange-900/30 to-transparent border-l-4 border-orange-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">🖼️ Resim URL'leri</h3>
                      <p className="text-gray-300 mb-3">Bölüm sayfalarının resim URL'lerini ekleyin. Her satıra bir URL yazın.</p>
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-700 space-y-2">
                        <p className="text-gray-400 text-xs font-bold mb-2">ÖRNEK FORMAT:</p>
                        <code className="text-green-400 text-xs block">
                          https://example.com/manga/chapter1/page1.jpg<br/>
                          https://example.com/manga/chapter1/page2.jpg<br/>
                          https://example.com/manga/chapter1/page3.jpg<br/>
                          https://example.com/manga/chapter1/page4.jpg
                        </code>
                        <div className="border-t border-gray-700 pt-2 mt-2">
                          <p className="text-gray-400 text-xs font-bold mb-1">VEYA VERGÜLLE:</p>
                          <code className="text-blue-400 text-xs block">
                            url1.jpg, url2.jpg, url3.jpg
                          </code>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <p className="text-gray-400 text-sm font-semibold">✅ Önemli Kurallar:</p>
                        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                          <li>URL'ler <code className="text-purple-400">http://</code> veya <code className="text-purple-400">https://</code> ile başlamalı</li>
                          <li>Sayfaları okuma sırasına göre ekleyin (1, 2, 3, 4...)</li>
                          <li>Her sayfa için ayrı URL gerekli</li>
                          <li>Yüksek çözünürlüklü resimler kullanın</li>
                          <li>Erişilebilir URL'ler kullanın (CDN, image host)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tips Section */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Hızlı İpuçları</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-purple-400 font-semibold mb-2">🎯 Rehber Butonu</p>
                      <p className="text-gray-400 text-sm">Adım adım görsel rehber için "📖 Rehber" butonuna tıklayın</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-blue-400 font-semibold mb-2">⚡ Örnek Doldur</p>
                      <p className="text-gray-400 text-sm">Hızlı test için "⚡ Örnek Doldur" butonu ile formu otomatik doldurun</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-green-400 font-semibold mb-2">✅ Otomatik Doğrulama</p>
                      <p className="text-gray-400 text-sm">Form doldururken otomatik hata kontrolü yapılır</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-yellow-400 font-semibold mb-2">📊 Sayfa Sayacı</p>
                      <p className="text-gray-400 text-sm">Eklediğiniz sayfa sayısı otomatik olarak hesaplanır</p>
                    </div>
                  </div>
                </div>
                
                {/* Close Button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHelpModal(false)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                  >
                    Anlaşıldı, Başlayalım! 🚀
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChapterAdd
