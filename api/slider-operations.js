import { Octokit } from '@octokit/rest'
import jwt from 'jsonwebtoken'
import { isBot, checkRateLimit, addSecurityHeaders } from './_rateLimit.js'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const REPO_OWNER = 'Enmxy'
const REPO_NAME = 'Mangexis'
const FILE_PATH = 'src/data/sliderData.json'

// Get slider data from GitHub
const getSliderData = async () => {
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

// Save slider data to GitHub
const saveSliderData = async (sliders, message, sha) => {
  try {
    const content = JSON.stringify(sliders, null, 2)
    
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
    throw new Error('Failed to save slider data')
  }
}

// Validate slider data
const validateSlider = (slider) => {
  const errors = []
  
  if (!slider.title || slider.title.trim().length < 2) {
    errors.push('Başlık en az 2 karakter olmalı')
  }
  
  if (!slider.image || !slider.image.startsWith('http')) {
    errors.push('Geçerli bir resim URL\'si gerekli')
  }
  
  if (!slider.type || !['manga', 'news', 'announcement'].includes(slider.type)) {
    errors.push('Geçerli bir tip seçin (manga, news, announcement)')
  }
  
  return errors
}

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Content-Type', 'application/json')

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Bot protection
  const userAgent = req.headers['user-agent'] || ''
  if (isBot(userAgent)) {
    console.log('🚫 Bot blocked:', userAgent)
    return res.status(403).json({ success: false, error: 'Automated access is not allowed' })
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
    // GET - Fetch all sliders
    if (req.method === 'GET') {
      const { content } = await getSliderData()
      return res.status(200).json({ success: true, sliders: content })
    }

    // POST - Create new slider
    if (req.method === 'POST') {
      const newSlider = req.body
      
      // Validate
      const errors = validateSlider(newSlider)
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors })
      }

      const { content: sliders, sha } = await getSliderData()
      
      // Generate ID
      const id = sliders.length > 0 
        ? Math.max(...sliders.map(s => s.id)) + 1 
        : 1
      
      const sliderToAdd = {
        id,
        ...newSlider,
        createdAt: Date.now()
      }
      
      sliders.push(sliderToAdd)
      
      await saveSliderData(
        sliders,
        `Add slider: ${newSlider.title}`,
        sha
      )

      return res.status(200).json({ 
        success: true, 
        message: 'Slider başarıyla eklendi',
        slider: sliderToAdd
      })
    }

    // PUT - Update slider
    if (req.method === 'PUT') {
      const updatedSlider = req.body
      
      if (!updatedSlider.id) {
        return res.status(400).json({ success: false, error: 'Slider ID gerekli' })
      }

      // Validate
      const errors = validateSlider(updatedSlider)
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors })
      }

      const { content: sliders, sha } = await getSliderData()
      const index = sliders.findIndex(s => s.id === updatedSlider.id)
      
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Slider bulunamadı' })
      }

      sliders[index] = { ...sliders[index], ...updatedSlider, updatedAt: Date.now() }
      
      await saveSliderData(
        sliders,
        `Update slider: ${updatedSlider.title}`,
        sha
      )

      return res.status(200).json({ 
        success: true, 
        message: 'Slider başarıyla güncellendi',
        slider: sliders[index]
      })
    }

    // DELETE - Remove slider
    if (req.method === 'DELETE') {
      const { id } = req.body
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Slider ID gerekli' })
      }

      const { content: sliders, sha } = await getSliderData()
      const index = sliders.findIndex(s => s.id === parseInt(id))
      
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Slider bulunamadı' })
      }

      const deletedSlider = sliders[index]
      sliders.splice(index, 1)
      
      await saveSliderData(
        sliders,
        `Delete slider: ${deletedSlider.title}`,
        sha
      )

      return res.status(200).json({ 
        success: true, 
        message: 'Slider başarıyla silindi'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Slider operations error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Sunucu hatası: ' + error.message 
    })
  }
}
