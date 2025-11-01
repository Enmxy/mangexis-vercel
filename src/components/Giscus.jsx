import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'

const Giscus = ({ term, category = 'General' }) => {
  const commentsRef = useRef(null)
  const { user, isSignedIn } = useUser()
  
  // Check if user logged in with GitHub
  const isGitHubUser = isSignedIn && user?.externalAccounts?.some(
    account => account.provider === 'oauth_github'
  )

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
      {/* User Info Banner */}
      {isSignedIn && (
        <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            {user.imageUrl && (
              <img 
                src={user.imageUrl} 
                alt={user.username || 'User'} 
                className="w-10 h-10 rounded-full ring-2 ring-purple-500/50"
              />
            )}
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                {user.username || user.firstName || 'Kullanıcı'} olarak giriş yaptınız
              </p>
              {isGitHubUser ? (
                <p className="text-green-400 text-xs mt-1">
                  ✅ GitHub hesabınız bağlı - Yorumlarınız GitHub profili ile görünecek
                </p>
              ) : (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠️ Yorum yapmak için Giscus'ta GitHub ile giriş yapmanız gerekiyor
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={commentsRef}
        className="giscus-comments bg-gray-900/50 rounded-lg p-6"
      />
    </div>
  )
}

export default Giscus
