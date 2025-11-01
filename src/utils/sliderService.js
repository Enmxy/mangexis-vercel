// Slider Service - API calls for slider management

const API_BASE = '/api/slider-operations'

export const getAllSliders = async () => {
  try {
    // Cache-busting: her istekte fresh data al
    const timestamp = new Date().getTime()
    const url = `${API_BASE}?t=${timestamp}`
    
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    })
    const data = await response.json()
    
    if (data.success) {
      return data.sliders
    }
    return []
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return []
  }
}

export const saveSlider = async (slider) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slider)
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error saving slider:', error)
    throw error
  }
}

export const updateSlider = async (slider) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slider)
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating slider:', error)
    throw error
  }
}

export const deleteSlider = async (id) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error deleting slider:', error)
    throw error
  }
}
