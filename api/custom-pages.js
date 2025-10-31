const { Octokit } = require('@octokit/rest')

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const REPO_OWNER = 'Enmxy'
const REPO_NAME = 'Mangexis'
const FILE_PATH = 'src/data/customPages.json'

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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Content-Type', 'application/json')

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // GET - Fetch all pages
    if (req.method === 'GET') {
      const { content } = await getPages()
      return res.status(200).json({ success: true, pages: content })
    }

    // POST - Create new page
    if (req.method === 'POST') {
      const newPage = req.body
      
      if (!newPage.slug || !newPage.title) {
        return res.status(400).json({ success: false, error: 'Slug ve başlık gerekli' })
      }

      const { content: pages, sha } = await getPages()
      
      // Check if page already exists
      if (pages.find(p => p.slug === newPage.slug)) {
        return res.status(400).json({ success: false, error: 'Bu slug zaten kullanılıyor' })
      }
      
      pages.push({
        ...newPage,
        createdAt: Date.now()
      })
      
      await savePages(pages, `Add page: ${newPage.title}`, sha)

      return res.status(200).json({ 
        success: true, 
        message: 'Sayfa başarıyla oluşturuldu'
      })
    }

    // PUT - Update page
    if (req.method === 'PUT') {
      const updatedPage = req.body
      
      if (!updatedPage.slug) {
        return res.status(400).json({ success: false, error: 'Slug gerekli' })
      }

      const { content: pages, sha } = await getPages()
      const index = pages.findIndex(p => p.slug === updatedPage.slug)
      
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Sayfa bulunamadı' })
      }

      pages[index] = { 
        ...pages[index], 
        ...updatedPage, 
        updatedAt: Date.now() 
      }
      
      await savePages(pages, `Update page: ${updatedPage.title}`, sha)

      return res.status(200).json({ 
        success: true, 
        message: 'Sayfa başarıyla güncellendi'
      })
    }

    // DELETE - Remove page
    if (req.method === 'DELETE') {
      const slug = req.query?.slug
      
      if (!slug) {
        return res.status(400).json({ success: false, error: 'Slug gerekli' })
      }

      const { content: pages, sha } = await getPages()
      const index = pages.findIndex(p => p.slug === slug)
      
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Sayfa bulunamadı' })
      }

      const deletedPage = pages[index]
      pages.splice(index, 1)
      
      await savePages(pages, `Delete page: ${deletedPage.title}`, sha)

      return res.status(200).json({ 
        success: true, 
        message: 'Sayfa başarıyla silindi'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Custom pages error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Sunucu hatası: ' + error.message 
    })
  }
}
