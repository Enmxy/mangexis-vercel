// Manga CRUD operations with Netlify Functions
import { authApi } from './adminApi'

const API_URL = '/api/manga-operations';
const UPLOAD_URL = '/api/upload-image';

// Check if running in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const uploadImage = async (file, maxRetries = 3) => {
  if (isDevelopment) {
    // Development mode: return mock URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('📁 [DEV] Image uploaded (mock):', file.name);
        resolve(e.target.result); // Return data URL for preview
      };
      reader.readAsDataURL(file);
    });
  }

  // Retry logic with exponential backoff
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Upload attempt ${attempt}/${maxRetries} for ${file.name}`);
      
      const reader = new FileReader();
      
      const imageData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        // High quality: read as data URL with no compression
        reader.readAsDataURL(file);
      });

      // Upload with retry-friendly timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageData,
            filename: file.name,
            quality: 100 // Request maximum quality
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.url) {
          console.log(`✅ Upload successful: ${file.name}`);
          return data.url;
        } else {
          throw new Error(data.error || 'Upload failed - no URL returned');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      
      // If not last attempt, wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5s
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  console.error(`❌ Upload failed after ${maxRetries} attempts:`, lastError);
  throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError.message}`);
};

export const saveManga = async (mangaData) => {
  if (isDevelopment) {
    // Development mode: save to localStorage
    console.log('💾 [DEV] Saving manga:', mangaData);
    const mangas = JSON.parse(localStorage.getItem('dev_mangas') || '[]');
    mangas.push(mangaData);
    localStorage.setItem('dev_mangas', JSON.stringify(mangas));
    return { success: true, message: 'Manga saved (dev mode)' };
  }

  try {
    const token = authApi.getToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        operation: 'CREATE_MANGA',
        manga: mangaData
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Save manga error:', error);
    throw error;
  }
};

export const updateManga = async (slug, mangaData) => {
  if (isDevelopment) {
    // Development mode: update in localStorage
    console.log('✏️ [DEV] Updating manga:', slug, mangaData);
    const mangas = JSON.parse(localStorage.getItem('dev_mangas') || '[]');
    const index = mangas.findIndex(m => m.slug === slug);
    if (index !== -1) {
      mangas[index] = mangaData;
      localStorage.setItem('dev_mangas', JSON.stringify(mangas));
    }
    return { success: true, message: 'Manga updated (dev mode)' };
  }

  try {
    const token = authApi.getToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        operation: 'UPDATE_MANGA',
        slug,
        manga: mangaData
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update manga error:', error);
    throw error;
  }
};

export const deleteManga = async (slug) => {
  if (isDevelopment) {
    // Development mode: delete from localStorage
    console.log('🗑️ [DEV] Deleting manga:', slug);
    const mangas = JSON.parse(localStorage.getItem('dev_mangas') || '[]');
    const filtered = mangas.filter(m => m.slug !== slug);
    localStorage.setItem('dev_mangas', JSON.stringify(filtered));
    return { success: true, message: 'Manga deleted (dev mode)' };
  }

  try {
    const token = authApi.getToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        operation: 'DELETE_MANGA',
        slug
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete manga error:', error);
    throw error;
  }
};

export const getAllMangas = async () => {
  if (isDevelopment) {
    // Development mode: get from localStorage
    const mangas = JSON.parse(localStorage.getItem('dev_mangas') || '[]');
    console.log('📚 [DEV] Getting mangas:', mangas.length);
    return mangas;
  }

  try {
    // Cache-busting: timestamp ekleyerek her istekte fresh data al
    const timestamp = new Date().getTime();
    const url = `${API_URL}?t=${timestamp}`;
    
    // Public endpoint - no token required
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache', // Browser cache'i bypass et
      body: JSON.stringify({
        operation: 'GET_ALL_MANGAS'
      })
    });

    const data = await response.json();
    return data.mangas || [];
  } catch (error) {
    console.error('Get mangas error:', error);
    return [];
  }
};
