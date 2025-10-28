// Manga CRUD operations with Netlify Functions

const API_URL = '/.netlify/functions/manga-operations';
const UPLOAD_URL = '/.netlify/functions/upload-image';

export const uploadImage = async (file) => {
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
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
