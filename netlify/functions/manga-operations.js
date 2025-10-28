// Simplified backend without external dependencies for Netlify
const BRANCH = 'main';

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

  // Check authentication (Netlify Identity)
  const user = context.clientContext?.user;
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized - Please login' })
    };
  }

  try {
    const { operation, manga, slug } = JSON.parse(event.body || '{}');
    const { owner, repo } = getRepoInfo();
    const githubHeaders = getGitHubHeaders();

    switch (operation) {
      case 'CREATE_MANGA': {
        const path = `src/data/mangas/${manga.slug}.json`;
        const content = Buffer.from(JSON.stringify(manga, null, 2)).toString('base64');

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Add manga: ${manga.title}`,
              content,
              branch: BRANCH
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create manga');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Manga created successfully' })
        };
      }

      case 'UPDATE_MANGA': {
        const path = `src/data/mangas/${slug}.json`;

        // Get current file SHA
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        );

        if (!getResponse.ok) {
          throw new Error('Manga not found');
        }

        const currentFile = await getResponse.json();
        const content = Buffer.from(JSON.stringify(manga, null, 2)).toString('base64');

        const updateResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Update manga: ${manga.title}`,
              content,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        );

        if (!updateResponse.ok) {
          const error = await updateResponse.json();
          throw new Error(error.message || 'Failed to update manga');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Manga updated successfully' })
        };
      }

      case 'DELETE_MANGA': {
        const path = `src/data/mangas/${slug}.json`;

        // Get current file SHA
        const getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${BRANCH}`,
          { headers: githubHeaders }
        );

        if (!getResponse.ok) {
          throw new Error('Manga not found');
        }

        const currentFile = await getResponse.json();

        const deleteResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'DELETE',
            headers: githubHeaders,
            body: JSON.stringify({
              message: `Delete manga: ${slug}`,
              sha: currentFile.sha,
              branch: BRANCH
            })
          }
        );

        if (!deleteResponse.ok) {
          const error = await deleteResponse.json();
          throw new Error(error.message || 'Failed to delete manga');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Manga deleted successfully' })
        };
      }

      case 'GET_ALL_MANGAS': {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/src/data/mangas?ref=${BRANCH}`,
          { headers: githubHeaders }
        );

        if (!response.ok) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ mangas: [] })
          };
        }

        const files = await response.json();
        const jsonFiles = files.filter(file => file.name.endsWith('.json'));

        const mangas = await Promise.all(
          jsonFiles.map(async (file) => {
            const fileResponse = await fetch(file.download_url);
            return await fileResponse.json();
          })
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ mangas })
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
