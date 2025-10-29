// Reading History Management with localStorage

const STORAGE_KEY = 'mangexis_reading_history';
const MAX_HISTORY_ITEMS = 50;

// Get all reading history
export const getReadingHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading reading history:', error);
    return [];
  }
};

// Add or update reading history
export const addToHistory = (manga, chapterId, pageNumber = 0, totalPages = 0) => {
  try {
    let history = getReadingHistory();
    
    // Find existing entry
    const existingIndex = history.findIndex(
      item => item.slug === manga.slug && item.chapterId === chapterId
    );
    
    const historyItem = {
      slug: manga.slug,
      title: manga.title,
      cover: manga.cover,
      chapterId,
      chapterTitle: `Bölüm ${chapterId}`,
      pageNumber,
      totalPages,
      timestamp: Date.now(),
      progress: totalPages > 0 ? Math.round((pageNumber / totalPages) * 100) : 0
    };
    
    if (existingIndex !== -1) {
      // Update existing entry
      history[existingIndex] = historyItem;
    } else {
      // Add new entry at the beginning
      history.unshift(historyItem);
    }
    
    // Keep only last MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return historyItem;
  } catch (error) {
    console.error('Error saving reading history:', error);
    return null;
  }
};

// Get last read chapter for a manga
export const getLastRead = (mangaSlug) => {
  const history = getReadingHistory();
  return history.find(item => item.slug === mangaSlug);
};

// Clear entire history
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

// Remove specific item from history
export const removeFromHistory = (mangaSlug, chapterId) => {
  try {
    let history = getReadingHistory();
    history = history.filter(
      item => !(item.slug === mangaSlug && item.chapterId === chapterId)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error removing from history:', error);
    return false;
  }
};

// Get reading statistics
export const getReadingStats = () => {
  const history = getReadingHistory();
  const uniqueMangas = new Set(history.map(item => item.slug)).size;
  const totalChapters = history.length;
  const completedChapters = history.filter(item => item.progress === 100).length;
  
  return {
    uniqueMangas,
    totalChapters,
    completedChapters,
    inProgressChapters: totalChapters - completedChapters
  };
};
