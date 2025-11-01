import jwt from 'jsonwebtoken'
import { Octokit } from '@octokit/rest'
import { isBot, checkRateLimit, addSecurityHeaders } from './_rateLimit.js'

const BRANCH = 'main'
const JWT_SECRET = process.env.JWT_SECRET || 'mangexis-super-secret-key-change-in-production'

// Helper to get GitHub API headers
const getGitHubHeaders = () => ({
  'Authorization': `token ${process.env.GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
})

// Get repo info from environment
const getRepoInfo = () => ({
  owner: process.env.REPO_OWNER || 'Enmxy',
  repo: process.env.REPO_NAME || 'Mangexis'
})

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Set headers
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Bot protection
  const userAgent = req.headers['user-agent'] || ''
  if (isBot(userAgent)) {
    console.log('🚫 Bot blocked:', userAgent)
    return res.status(403).json({ 
      success: false, 
      error: 'Automated access is not allowed' 
    })
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'
  const rateLimit = checkRateLimit(ip, userAgent)
  
  if (!rateLimit.allowed) {
    console.log('⚠️ Rate limit exceeded:', ip)
    res.setHeader('Retry-After', rateLimit.retryAfter)
    return res.status(429).json({ 
      success: false, 
      error: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    })
  }

  try {
    const { operation, manga, slug } = req.body || {}
    
    // Public operation - no auth required
    if (operation === 'GET_ALL_MANGAS') {
      const { owner, repo } = getRepoInfo()
      const githubHeaders = getGitHubHeaders()
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/mangas?ref=${BRANCH}`,
        { headers: githubHeaders }
      )

      if (!response.ok) {
        return res.status(200).json({ mangas: [] })
      }

      const files = await response.json()
      const jsonFiles = files.filter(file => file.name.endsWith('.json'))

      const mangas = await Promise.all(
        jsonFiles.map(async (file) => {
          const fileResponse = await fetch(file.download_url)
          return await fileResponse.json()
        })
      )

      return res.status(200).json({ mangas })
    }

    // Protected operations - require authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' })
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' })
    }

    const { owner, repo } = getRepoInfo()
    const githubHeaders = getGitHubHeaders()

    switch (operation) {
      case 'CREATE_MANGA': {
        const path = `src/data/mangas/${manga.slug}.json`
        const content = Buffer.from(JSON.stringify(manga, null, 2)).toString('base64')

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Add manga: ${manga.title}`,
              content,
              branch: BRANCH
            })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create manga')
        }

        return res.status(200).json({ success: true, message: 'Manga created successfully' })
      }

      case 'UPDATE_MANGA': {
        const path = `src/data/mangas/${slug}.json`

        // Get current file SHA
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        )

        if (!getResponse.ok) {
          throw new Error('Manga not found')
        }

        const currentFile = await getResponse.json()
        const content = Buffer.from(JSON.stringify(manga, null, 2)).toString('base64')

        const updateResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Update manga: ${manga.title}`,
              content,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        )

        if (!updateResponse.ok) {
          const error = await updateResponse.json()
          throw new Error(error.message || 'Failed to update manga')
        }

        return res.status(200).json({ success: true, message: 'Manga updated successfully' })
      }

      case 'ADD_CHAPTER': {
        const path = `src/data/mangas/${slug}.json`
        const chapterData = req.body.chapter

        if (!chapterData) {
          throw new Error('Chapter data required')
        }

        // Get current manga file
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        )

        if (!getResponse.ok) {
          throw new Error('Manga not found')
        }

        const currentFile = await getResponse.json()
        const mangaContent = JSON.parse(Buffer.from(currentFile.content, 'base64').toString('utf-8'))

        // Add new chapter
        if (!mangaContent.chapters) {
          mangaContent.chapters = []
        }

        // Check if chapter already exists
        const existingChapterIndex = mangaContent.chapters.findIndex(ch => ch.id === chapterData.id)
        if (existingChapterIndex !== -1) {
          throw new Error(`Chapter ${chapterData.id} already exists`)
        }

        mangaContent.chapters.push(chapterData)

        // Sort chapters by ID
        mangaContent.chapters.sort((a, b) => parseInt(a.id) - parseInt(b.id))

        // Update file
        const content = Buffer.from(JSON.stringify(mangaContent, null, 2)).toString('base64')
        const updateResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Add chapter ${chapterData.id} to ${mangaContent.title}`,
              content,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        )

        if (!updateResponse.ok) {
          const error = await updateResponse.json()
          throw new Error(error.message || 'Failed to add chapter')
        }

        return res.status(200).json({ success: true, message: 'Chapter added successfully' })
      }

      case 'DELETE_MANGA': {
        const path = `src/data/mangas/${slug}.json`

        // Get current file SHA
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        )

        if (!getResponse.ok) {
          throw new Error('Manga not found')
        }

        const currentFile = await getResponse.json()

        const deleteResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'DELETE',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Delete manga: ${slug}`,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        )

        if (!deleteResponse.ok) {
          const error = await deleteResponse.json()
          throw new Error(error.message || 'Failed to delete manga')
        }

        return res.status(200).json({ success: true, message: 'Manga deleted successfully' })
      }

      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
