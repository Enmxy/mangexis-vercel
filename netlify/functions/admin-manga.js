const jwt = require('jsonwebtoken')
const { Octokit } = require('@octokit/rest')

const JWT_SECRET = process.env.JWT_SECRET || 'mangexis-super-secret-key-change-in-production'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = process.env.REPO_OWNER || 'Enmxy'
const REPO_NAME = process.env.REPO_NAME || 'Mangexis'

const octokit = new Octokit({ auth: GITHUB_TOKEN })

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Get manga data from GitHub
const getMangaData = async () => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'src/data/mangaData.js'
    })

    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return { content, sha: data.sha }
  } catch (error) {
    throw new Error('Failed to fetch manga data')
  }
}

// Update manga data on GitHub
const updateMangaData = async (content, sha, message) => {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'src/data/mangaData.js',
      message,
      content: Buffer.from(content).toString('base64'),
      sha
    })
    return true
  } catch (error) {
    throw new Error('Failed to update manga data')
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // Verify authentication
  const token = event.headers.authorization?.replace('Bearer ', '')
  const user = verifyToken(token)

  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  try {
    const { action, manga } = event.httpMethod === 'POST' ? JSON.parse(event.body) : {}

    // GET - Fetch all mangas
    if (event.httpMethod === 'GET') {
      const { content } = await getMangaData()
      
      // Extract mangaList from the file
      const mangaListMatch = content.match(/export const mangaList = (\[[\s\S]*?\n\])/m)
      if (mangaListMatch) {
        const mangaListStr = mangaListMatch[1]
        // This is a simple extraction, in production you'd use a proper parser
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, content })
        }
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to parse manga data' })
      }
    }

    // POST - Add new manga
    if (event.httpMethod === 'POST' && action === 'add') {
      const { content, sha } = await getMangaData()
      
      // Insert new manga into the array (simplified)
      // In production, use a proper JS parser like babel
      const updated = content.replace(
        /export const mangaList = \[/,
        `export const mangaList = [\n  ${JSON.stringify(manga, null, 2)},`
      )

      await updateMangaData(updated, sha, `Add manga: ${manga.title}`)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Manga added successfully' })
      }
    }

    // POST - Update manga
    if (event.httpMethod === 'POST' && action === 'update') {
      const { content, sha } = await getMangaData()
      
      // Find and replace manga by slug
      // This is simplified - in production use proper parsing
      const mangaStr = JSON.stringify(manga, null, 2)
      const slugPattern = new RegExp(`slug: '${manga.slug}'[\\s\\S]*?(?=\\n  \\{|\\n\\])`,'g')
      const updated = content.replace(slugPattern, mangaStr.slice(1, -1))

      await updateMangaData(updated, sha, `Update manga: ${manga.title}`)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Manga updated successfully' })
      }
    }

    // POST - Delete manga
    if (event.httpMethod === 'POST' && action === 'delete') {
      const { slug } = manga
      const { content, sha } = await getMangaData()
      
      // Remove manga by slug (simplified)
      const mangaPattern = new RegExp(`\\{[\\s\\S]*?slug: '${slug}'[\\s\\S]*?\\},?\\n`, 'g')
      const updated = content.replace(mangaPattern, '')

      await updateMangaData(updated, sha, `Delete manga: ${slug}`)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Manga deleted successfully' })
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}
