// Manga CRUD operations with Netlify Functions
import { authApi } from './adminApi'

const API_URL = '/api/manga-operations';
const UPLOAD_URL = '/api/upload-image';

// Check if running in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const uploadImage = async (file) => {
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

  try {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: e.target.result,
              filename: file.name
            })
          });

          const data = await response.json();
          
          if (data.success) {
            resolve(data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
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
    // Public endpoint - no token required
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
