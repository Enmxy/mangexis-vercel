import { useEffect } from 'react'

/**
 * Otomatik sayfa yenileme hook'u
 * Her 10 saniyede bir sayfayı yeniler, ancak kullanıcının scroll pozisyonunu korur
 */
const useAutoRefresh = (intervalSeconds = 10, { enabled = true } = {}) => {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    // Scroll pozisyonunu kaydet
    const saveScrollPosition = () => {
      const scrollData = {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now(),
        path: window.location.pathname
      }
      sessionStorage.setItem('autoRefresh_scrollPos', JSON.stringify(scrollData))
      sessionStorage.setItem('autoRefresh_skipIntro', 'true')
    }

    // Scroll pozisyonunu geri yükle
    const restoreScrollPosition = () => {
      try {
        const savedData = sessionStorage.getItem('autoRefresh_scrollPos')
        if (savedData) {
          const { x, y, timestamp, path } = JSON.parse(savedData)
          
          // Aynı sayfa ve son 5 saniye içinde kaydedilmişse geri yükle
          if (path === window.location.pathname && Date.now() - timestamp < 5000) {
            // Sayfa tamamen yüklendikten sonra scroll yap
            setTimeout(() => {
              window.scrollTo(x, y)
            }, 100)
          }
          
          // Kullanıldı, temizle
          sessionStorage.removeItem('autoRefresh_scrollPos')
          sessionStorage.removeItem('autoRefresh_skipIntro')
        }
      } catch (error) {
        console.error('Scroll pozisyonu geri yüklenirken hata:', error)
      }
    }

    // Sayfa yüklendiğinde scroll pozisyonunu geri yükle
    restoreScrollPosition()

    // Otomatik yenileme interval'i
    const refreshInterval = setInterval(() => {
      saveScrollPosition()
      window.location.reload()
    }, intervalSeconds * 1000)

    // Sayfa yenilenmeden önce scroll pozisyonunu kaydet (güvenlik)
    const handleBeforeUnload = () => {
      saveScrollPosition()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [intervalSeconds, enabled])
}

export default useAutoRefresh
