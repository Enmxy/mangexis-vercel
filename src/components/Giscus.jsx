import { useEffect, useRef } from 'react'

const Giscus = ({ term, category = 'General' }) => {
  const commentsRef = useRef(null)

  useEffect(() => {
    if (!commentsRef.current) return

    // Clear existing comments
    commentsRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'Enmxy/mangexis-vercel')
    script.setAttribute('data-repo-id', 'R_kgDOQM0tVA')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDOQM0tVM4CxTlt')
    script.setAttribute('data-mapping', term ? 'specific' : 'pathname')
    if (term) {
      script.setAttribute('data-term', term)
    }
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'dark')
    script.setAttribute('data-lang', 'tr')
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true

    commentsRef.current.appendChild(script)

    return () => {
      if (commentsRef.current) {
        commentsRef.current.innerHTML = ''
      }
    }
  }, [term, category])

  return (
    <div className="giscus-wrapper mt-8">
      <div 
        ref={commentsRef}
        className="giscus-comments bg-gray-900/50 rounded-lg p-6"
      />
    </div>
  )
}

export default Giscus
