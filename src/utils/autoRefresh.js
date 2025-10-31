// Otomatik sayfa yenileme - Görünmez ve yumuşak
// Her 5 dakikada bir arka planda içerik günceller

let refreshInterval = null
let isRefreshing = false

export const startAutoRefresh = (callback, intervalMinutes = 5) => {
  // Zaten çalışıyorsa başlatma
  if (refreshInterval) return

  const intervalMs = intervalMinutes * 60 * 1000

  refreshInterval = setInterval(async () => {
    if (isRefreshing) return
    
    try {
      isRefreshing = true
      
      // Kullanıcı scroll yapıyorsa bekleme
      if (isUserScrolling()) {
        isRefreshing = false
        return
      }

      // Callback ile içerik güncelle (API call)
      if (callback) {
        await callback()
      }
      
      isRefreshing = false
    } catch (error) {
      console.error('Auto refresh error:', error)
      isRefreshing = false
    }
  }, intervalMs)
}

export const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Kullanıcı scroll yapıyor mu kontrol
let lastScrollY = window.scrollY
let scrollTimeout = null

const isUserScrolling = () => {
  return new Promise((resolve) => {
    const currentScrollY = window.scrollY
    const isScrolling = Math.abs(currentScrollY - lastScrollY) > 5
    lastScrollY = currentScrollY

    if (isScrolling) {
      // Scroll yapıyor, 2 saniye bekle
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        resolve(false)
      }, 2000)
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

// Sayfa visibility değiştiğinde kontrol et
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Sayfa gizli, refresh'i durdur
    isRefreshing = false
  }
})
