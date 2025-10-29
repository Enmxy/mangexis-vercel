import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Comments = ({ identifier, title }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    loadComments()
    loadUsername()
  }, [identifier])

  const loadComments = () => {
    const saved = localStorage.getItem(`comments-${identifier}`)
    if (saved) {
      setComments(JSON.parse(saved))
    }
  }

  const loadUsername = () => {
    const saved = localStorage.getItem('comment-username')
    if (saved) {
      setUsername(saved)
    }
  }

  const saveUsername = (name) => {
    localStorage.setItem('comment-username', name)
    setUsername(name)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim() || !username.trim()) return

    const comment = {
      id: Date.now(),
      username: username.trim(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    }

    const updated = [comment, ...comments]
    setComments(updated)
    localStorage.setItem(`comments-${identifier}`, JSON.stringify(updated))
    setNewComment('')
  }

  const handleLike = (commentId) => {
    const updated = comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    )
    setComments(updated)
    localStorage.setItem(`comments-${identifier}`, JSON.stringify(updated))
  }

  const handleDelete = (commentId) => {
    const updated = comments.filter(c => c.id !== commentId)
    setComments(updated)
    localStorage.setItem(`comments-${identifier}`, JSON.stringify(updated))
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Az önce'
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
    return `${Math.floor(diff / 86400)} gün önce`
  }

  return (
    <div className="w-full">
      <div className="border-t border-white/10 pt-8 mt-8">
        <h3 className="text-xl font-semibold text-white mb-6">💬 Yorumlar ({comments.length})</h3>
        
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-3">
            <input
              type="text"
              value={username}
              onChange={(e) => saveUsername(e.target.value)}
              placeholder="Adınız"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all"
              required
            />
          </div>
          <div className="mb-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all resize-none"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            Yorum Yap
          </motion.button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Henüz yorum yapılmamış. İlk yorumu siz yapın!
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {comment.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{comment.username}</p>
                      <p className="text-xs text-gray-400">{formatDate(comment.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-300 mb-3 whitespace-pre-wrap">{comment.text}</p>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="text-sm">{comment.likes > 0 && comment.likes}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Comments
