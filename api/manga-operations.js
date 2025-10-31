import jwt from 'jsonwebtoken'
import { Octokit } from '@octokit/rest'
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
