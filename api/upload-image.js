module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, filename } = req.body
    
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' })
    }
    
    // Remove data:image/... prefix
    const base64Image = image.includes(',') ? image.split(',')[1] : image
    
    // Upload to imgbb (free image hosting)
    const formData = new URLSearchParams()
    formData.append('image', base64Image)
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    const data = await response.json()

    if (data.success) {
      return res.status(200).json({ 
        success: true, 
        url: data.data.url,
        display_url: data.data.display_url
      })
    } else {
      throw new Error('Upload failed')
    }
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: error.message })
  }
}
