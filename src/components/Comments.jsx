import { useEffect, useRef } from 'react'

const Comments = ({ identifier, title }) => {
  const commentsRef = useRef(null)

  useEffect(() => {
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="giscus"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Clear container
    if (commentsRef.current) {
      commentsRef.current.innerHTML = ''
    }

    // Create new script
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'Enmxy/Mangexis')
    script.setAttribute('data-repo-id', 'R_kgDOPo9WYg')
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', 'DIC_kwDOPo9WYs4CxK8m')
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', identifier)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'dark')
    script.setAttribute('data-lang', 'tr')
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true

    if (commentsRef.current) {
      commentsRef.current.appendChild(script)
    }

    return () => {
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [identifier])

  return (
    <div className="w-full">
      <div className="border-t border-white/10 pt-8 mt-8">
        <h3 className="text-xl font-semibold text-white mb-6">💬 Yorumlar</h3>
        <div ref={commentsRef} className="giscus-container" />
      </div>
    </div>
  )
}

export default Comments
