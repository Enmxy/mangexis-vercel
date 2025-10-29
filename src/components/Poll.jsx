import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Poll = ({ poll, newsSlug }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votes, setVotes] = useState({})
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    // Load votes from localStorage
    const pollKey = `poll_${newsSlug}_${poll.id}`
    const savedVotes = JSON.parse(localStorage.getItem(pollKey) || '{}')
    const userVote = localStorage.getItem(`${pollKey}_voted`)
    
    if (userVote) {
      setHasVoted(true)
      setSelectedOption(userVote)
    }

    // Initialize votes
    const initialVotes = {}
    let total = 0
    poll.options.forEach(opt => {
      const count = savedVotes[opt] || 0
      initialVotes[opt] = count
      total += count
    })
    setVotes(initialVotes)
    setTotalVotes(total)
  }, [newsSlug, poll.id, poll.options])

  const handleVote = (option) => {
    if (hasVoted) return

    const pollKey = `poll_${newsSlug}_${poll.id}`
    
    // Update vote count
    const newVotes = { ...votes, [option]: (votes[option] || 0) + 1 }
    setVotes(newVotes)
    setTotalVotes(totalVotes + 1)
    
    // Save to localStorage
    localStorage.setItem(pollKey, JSON.stringify(newVotes))
    localStorage.setItem(`${pollKey}_voted`, option)
    
    setSelectedOption(option)
    setHasVoted(true)
  }

  const getPercentage = (option) => {
    if (totalVotes === 0) return 0
    return Math.round((votes[option] || 0) / totalVotes * 100)
  }

  const getColor = (index) => {
    const colors = [
      'from-purple-600 to-purple-700',
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-orange-600 to-orange-700',
      'from-pink-600 to-pink-700'
    ]
    return colors[index % colors.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-purple-500/30 shadow-xl"
    >
      {/* Poll Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-bold text-white">{poll.question}</h3>
      </div>

      {/* Poll Options */}
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option)
          const isSelected = selectedOption === option
          const voteCount = votes[option] || 0

          return (
            <motion.button
              key={option}
              onClick={() => handleVote(option)}
              disabled={hasVoted}
              whileHover={!hasVoted ? { scale: 1.02 } : {}}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              className={`w-full relative overflow-hidden rounded-lg border-2 transition-all ${
                hasVoted
                  ? isSelected
                    ? 'border-purple-500'
                    : 'border-gray-700'
                  : 'border-gray-700 hover:border-purple-500 cursor-pointer'
              }`}
            >
              {/* Progress Bar */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`absolute inset-0 bg-gradient-to-r ${getColor(index)} opacity-30`}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {hasVoted && isSelected && (
                    <span className="text-lg">✓</span>
                  )}
                  <span className={`font-medium ${
                    hasVoted ? 'text-white' : 'text-gray-300'
                  }`}>
                    {option}
                  </span>
                </div>

                {hasVoted && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {voteCount} oy
                    </span>
                    <span className="text-white font-bold min-w-[3rem] text-right">
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Total Votes */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm text-center">
          {hasVoted ? (
            <>
              ✅ Oyunuz kaydedildi • <span className="font-medium text-white">{totalVotes}</span> toplam oy
            </>
          ) : (
            <>
              Bir seçenek seçin • <span className="font-medium text-white">{totalVotes}</span> kişi oy verdi
            </>
          )}
        </p>
      </div>
    </motion.div>
  )
}

export default Poll
