// Slider Operations - Admin Panel Slider Management
const { Octokit } = require('@octokit/rest')

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const REPO_OWNER = 'Enmxy'
const REPO_NAME = 'Mangexis'
const FILE_PATH = 'src/data/sliderData.json'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

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

exports.handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // GET - Fetch all sliders
    if (event.httpMethod === 'GET') {
      const { content } = await getSliderData()
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, sliders: content })
      }
    }

    // POST - Create new slider
    if (event.httpMethod === 'POST') {
      const newSlider = JSON.parse(event.body)
      
      // Validate
      const errors = validateSlider(newSlider)
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, errors })
        }
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Slider başarıyla eklendi',
          slider: sliderToAdd
        })
      }
    }

    // PUT - Update slider
    if (event.httpMethod === 'PUT') {
      const updatedSlider = JSON.parse(event.body)
      
      if (!updatedSlider.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Slider ID gerekli' })
        }
      }

      // Validate
      const errors = validateSlider(updatedSlider)
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, errors })
        }
      }

      const { content: sliders, sha } = await getSliderData()
      const index = sliders.findIndex(s => s.id === updatedSlider.id)
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'Slider bulunamadı' })
        }
      }

      sliders[index] = { ...sliders[index], ...updatedSlider, updatedAt: Date.now() }
      
      await saveSliderData(
        sliders,
        `Update slider: ${updatedSlider.title}`,
        sha
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Slider başarıyla güncellendi',
          slider: sliders[index]
        })
      }
    }

    // DELETE - Remove slider
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body)
      
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Slider ID gerekli' })
        }
      }

      const { content: sliders, sha } = await getSliderData()
      const index = sliders.findIndex(s => s.id === parseInt(id))
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'Slider bulunamadı' })
        }
      }

      const deletedSlider = sliders[index]
      sliders.splice(index, 1)
      
      await saveSliderData(
        sliders,
        `Delete slider: ${deletedSlider.title}`,
        sha
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Slider başarıyla silindi'
        })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Slider operations error:', error)
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
