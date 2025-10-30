const { Octokit } = require('@octokit/rest')

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const REPO_OWNER = 'Enmxy'
const REPO_NAME = 'Mangexis'
const FILE_PATH = 'src/data/customPages.json'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

// Get pages from GitHub
const getPages = async () => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH
    })
    
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return { content: JSON.parse(content), sha: data.sha }
  } catch (error) {
    if (error.status === 404) {
      return { content: [], sha: null }
    }
    throw error
  }
}

// Save pages to GitHub
const savePages = async (pages, message, sha) => {
  try {
    const content = JSON.stringify(pages, null, 2)
    
    if (sha) {
      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
        message,
        content: Buffer.from(content).toString('base64'),
        sha
      })
    } else {
      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
        message,
        content: Buffer.from(content).toString('base64')
      })
    }
    return true
  } catch (error) {
    console.error('GitHub save error:', error)
    throw new Error('Failed to save pages')
  }
}

exports.handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // GET - Fetch all pages
    if (event.httpMethod === 'GET') {
      const { content } = await getPages()
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, pages: content })
      }
    }

    // POST - Create new page
    if (event.httpMethod === 'POST') {
      const newPage = JSON.parse(event.body)
      
      if (!newPage.slug || !newPage.title) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Slug ve başlık gerekli' })
        }
      }

      const { content: pages, sha } = await getPages()
      
      // Check if page already exists
      if (pages.find(p => p.slug === newPage.slug)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Bu slug zaten kullanılıyor' })
        }
      }
      
      pages.push({
        ...newPage,
        createdAt: Date.now()
      })
      
      await savePages(pages, `Add page: ${newPage.title}`, sha)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Sayfa başarıyla oluşturuldu'
        })
      }
    }

    // PUT - Update page
    if (event.httpMethod === 'PUT') {
      const updatedPage = JSON.parse(event.body)
      
      if (!updatedPage.slug) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Slug gerekli' })
        }
      }

      const { content: pages, sha } = await getPages()
      const index = pages.findIndex(p => p.slug === updatedPage.slug)
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'Sayfa bulunamadı' })
        }
      }

      pages[index] = { 
        ...pages[index], 
        ...updatedPage, 
        updatedAt: Date.now() 
      }
      
      await savePages(pages, `Update page: ${updatedPage.title}`, sha)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Sayfa başarıyla güncellendi'
        })
      }
    }

    // DELETE - Remove page
    if (event.httpMethod === 'DELETE') {
      const slug = event.queryStringParameters?.slug
      
      if (!slug) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Slug gerekli' })
        }
      }

      const { content: pages, sha } = await getPages()
      const index = pages.findIndex(p => p.slug === slug)
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'Sayfa bulunamadı' })
        }
      }

      const deletedPage = pages[index]
      pages.splice(index, 1)
      
      await savePages(pages, `Delete page: ${deletedPage.title}`, sha)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Sayfa başarıyla silindi'
        })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Custom pages error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Sunucu hatası: ' + error.message 
      })
    }
  }
}
