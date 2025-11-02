/**
 * İçerik güncelleme event sistemi
 * Admin panelden manga/bölüm eklendiğinde ana sayfayı otomatik yeniler
 */

// Event type'ları
export const UPDATE_TYPES = {
  MANGA_ADDED: 'manga_added',
  CHAPTER_ADDED: 'chapter_added',
  NEWS_ADDED: 'news_added',
  SLIDER_ADDED: 'slider_added',
  CONTENT_UPDATED: 'content_updated'
}

/**
 * İçerik güncellendiğini bildir (Admin panelden çağrılır)
 */
export const notifyContentUpdate = (type = UPDATE_TYPES.CONTENT_UPDATED, data = {}) => {
  const event = {
    type,
    timestamp: Date.now(),
    data
  }
  
  // localStorage'a yaz
  localStorage.setItem('content_update_event', JSON.stringify(event))
  
  // Storage event tetikle (diğer tab'lar için)
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'content_update_event',
    newValue: JSON.stringify(event),
    url: window.location.href
  }))
  
  // Custom event tetikle (aynı tab için)
  window.dispatchEvent(new CustomEvent('contentUpdate', { detail: event }))
}

/**
 * İçerik güncellemelerini dinle (Ana sayfada çağrılır)
 */
export const listenContentUpdates = (callback) => {
  // localStorage değişimini dinle (diğer tab'lardan gelen)
  const handleStorageChange = (e) => {
    if (e.key === 'content_update_event' && e.newValue) {
      try {
        const event = JSON.parse(e.newValue)
        callback(event)
        
        // Event'i temizle (bir kere tetiklenmeli)
        setTimeout(() => {
          localStorage.removeItem('content_update_event')
        }, 1000)
      } catch (error) {
        console.error('Content update event parse error:', error)
      }
    }
  }
  
  // Custom event dinle (aynı tab'dan gelen)
  const handleCustomEvent = (e) => {
    callback(e.detail)
  }
  
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('contentUpdate', handleCustomEvent)
  
  // Cleanup fonksiyonu
  return () => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('contentUpdate', handleCustomEvent)
  }
}

/**
 * Son güncelleme zamanını kontrol et
 */
export const getLastUpdateTime = () => {
  try {
    const event = localStorage.getItem('content_update_event')
    if (event) {
      const { timestamp } = JSON.parse(event)
      return timestamp
    }
  } catch (error) {
    console.error('Error getting last update time:', error)
  }
  return null
}
