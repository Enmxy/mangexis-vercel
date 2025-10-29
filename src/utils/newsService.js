// News CRUD operations with Netlify Functions
import { authApi } from './adminApi'

const API_URL = '/.netlify/functions/news-operations';

// Check if running in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const saveNews = async (newsData) => {
  if (isDevelopment) {
    // Development mode: save to localStorage
    console.log('💾 [DEV] Saving news:', newsData);
    const news = JSON.parse(localStorage.getItem('dev_news') || '[]');
    news.push(newsData);
    localStorage.setItem('dev_news', JSON.stringify(news));
    return { success: true, message: 'News saved (dev mode)' };
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
        operation: 'CREATE_NEWS',
        news: newsData
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Save news error:', error);
    throw error;
  }
};

export const updateNews = async (slug, newsData) => {
  if (isDevelopment) {
    // Development mode: update in localStorage
    console.log('✏️ [DEV] Updating news:', slug, newsData);
    const news = JSON.parse(localStorage.getItem('dev_news') || '[]');
    const index = news.findIndex(n => n.slug === slug);
    if (index !== -1) {
      news[index] = newsData;
      localStorage.setItem('dev_news', JSON.stringify(news));
    }
    return { success: true, message: 'News updated (dev mode)' };
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
        operation: 'UPDATE_NEWS',
        slug,
        news: newsData
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update news error:', error);
    throw error;
  }
};

export const deleteNews = async (slug) => {
  if (isDevelopment) {
    // Development mode: delete from localStorage
    console.log('🗑️ [DEV] Deleting news:', slug);
    const news = JSON.parse(localStorage.getItem('dev_news') || '[]');
    const filtered = news.filter(n => n.slug !== slug);
    localStorage.setItem('dev_news', JSON.stringify(filtered));
    return { success: true, message: 'News deleted (dev mode)' };
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
        operation: 'DELETE_NEWS',
        slug
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete news error:', error);
    throw error;
  }
};

export const getAllNews = async () => {
  if (isDevelopment) {
    // Development mode: get from localStorage
    const news = JSON.parse(localStorage.getItem('dev_news') || '[]');
    console.log('📰 [DEV] Getting news:', news.length);
    return news;
  }

  try {
    // Public endpoint - no token required
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'GET_ALL_NEWS'
      })
    });

    const data = await response.json();
    return data.news || [];
  } catch (error) {
    console.error('Get news error:', error);
    return [];
  }
};
