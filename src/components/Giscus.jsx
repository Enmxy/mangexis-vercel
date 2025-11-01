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
                <div className="mt-1.5 space-y-1">
                  <p className="text-green-400 text-xs flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="font-medium">GitHub hesabınız bağlı</span>
                  </p>
                  <p className="text-gray-400 text-xs">
                    Yorum yapmak için aşağıdaki yorum bölümünde <span className="text-white font-medium">"Sign in with GitHub"</span> butonuna tıklayın. Aynı GitHub hesabınızla giriş yapacaksınız.
                  </p>
                </div>
              ) : (
                <div className="mt-1.5 space-y-1">
                  <p className="text-yellow-400 text-xs flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">GitHub hesabı bağlı değil</span>
                  </p>
                  <p className="text-gray-400 text-xs">
                    Yorum yapabilmek için aşağıdaki yorum bölümünde <span className="text-white font-medium">"Sign in with GitHub"</span> ile giriş yapmanız gerekiyor.
                  </p>
                </div>
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
