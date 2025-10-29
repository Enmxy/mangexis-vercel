// News CRUD operations backend
const jwt = require('jsonwebtoken')
const BRANCH = 'main';
const JWT_SECRET = process.env.JWT_SECRET || 'mangexis-super-secret-key-change-in-production';

// Helper to get GitHub API headers
const getGitHubHeaders = () => ({
  'Authorization': `token ${process.env.GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
});

// Get repo info from environment
const getRepoInfo = () => ({
  owner: process.env.REPO_OWNER || 'Enmxy',
  repo: process.env.REPO_NAME || 'Mangexis'
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { operation, news, slug } = JSON.parse(event.body || '{}');
    
    // Public operation - no auth required
    if (operation === 'GET_ALL_NEWS') {
      const { owner, repo } = getRepoInfo();
      const githubHeaders = getGitHubHeaders();
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/news?ref=${BRANCH}`,
        { headers: githubHeaders }
      );

      if (!response.ok) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ news: [] })
        };
      }

      const files = await response.json();
      const jsonFiles = files.filter(file => file.name.endsWith('.json'));

      const newsItems = await Promise.all(
        jsonFiles.map(async (file) => {
          const fileResponse = await fetch(file.download_url);
          return await fileResponse.json();
        })
      );

      // Sort by date descending
      newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ news: newsItems })
      };
    }

    // Protected operations - require authentication
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - No token provided' })
      };
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Invalid token' })
      };
    }

    const { owner, repo } = getRepoInfo();
    const githubHeaders = getGitHubHeaders();

    switch (operation) {
      case 'CREATE_NEWS': {
        const path = `src/data/news/${news.slug}.json`;
        const content = Buffer.from(JSON.stringify(news, null, 2)).toString('base64');

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Add news: ${news.title}`,
              content,
              branch: BRANCH
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create news');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'News created successfully' })
        };
      }

      case 'UPDATE_NEWS': {
        const path = `src/data/news/${slug}.json`;

        // Get current file SHA
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        );

        if (!getResponse.ok) {
          throw new Error('News not found');
        }

        const currentFile = await getResponse.json();
        const content = Buffer.from(JSON.stringify(news, null, 2)).toString('base64');

        const updateResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Update news: ${news.title}`,
              content,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        );

        if (!updateResponse.ok) {
          const error = await updateResponse.json();
          throw new Error(error.message || 'Failed to update news');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'News updated successfully' })
        };
      }

      case 'DELETE_NEWS': {
        const path = `src/data/news/${slug}.json`;

        // Get current file SHA
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        );

        if (!getResponse.ok) {
          throw new Error('News not found');
        }

        const currentFile = await getResponse.json();

        const deleteResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'DELETE',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Delete news: ${slug}`,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        );

        if (!deleteResponse.ok) {
          const error = await deleteResponse.json();
          throw new Error(error.message || 'Failed to delete news');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'News deleted successfully' })
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid operation' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
