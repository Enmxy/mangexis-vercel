const { Octokit } = require("@octokit/rest");

// GitHub API client
const getOctokit = (token) => {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN
  });
};

// Get repository info from environment
const REPO_OWNER = process.env.REPO_OWNER || 'your-username';
const REPO_NAME = process.env.REPO_NAME || 'mangexis';
const BRANCH = 'main';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Check authentication
  const user = context.clientContext?.user;
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const octokit = getOctokit(process.env.GITHUB_TOKEN);
    const { operation } = JSON.parse(event.body || '{}');

    switch (operation) {
      case 'CREATE_MANGA': {
        const { manga } = JSON.parse(event.body);
        const path = `src/data/mangas/${manga.slug}.json`;
        const content = Buffer.from(JSON.stringify(manga, null, 2)).toString('base64');

        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path,
          message: `Add manga: ${manga.title}`,
          content,
          branch: BRANCH
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Manga created' })
        };
      }

      case 'UPDATE_MANGA': {
        const { slug, manga } = JSON.parse(event.body);
        const path = `src/data/mangas/${slug}.json`;

        // Get current file SHA
        const { data: currentFile } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path,
          ref: BRANCH
        });

        const content = Buffer.from(JSON.stringify(manga, null, 2)).toString('base64');

        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path,
          message: `Update manga: ${manga.title}`,
          content,
          sha: currentFile.sha,
          branch: BRANCH
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Manga updated' })
        };
      }

      case 'DELETE_MANGA': {
        const { slug } = JSON.parse(event.body);
        const path = `src/data/mangas/${slug}.json`;

        // Get current file SHA
        const { data: currentFile } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path,
          ref: BRANCH
        });

        await octokit.repos.deleteFile({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path,
          message: `Delete manga: ${slug}`,
          sha: currentFile.sha,
          branch: BRANCH
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Manga deleted' })
        };
      }

      case 'GET_ALL_MANGAS': {
        const { data: files } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: 'src/data/mangas',
          ref: BRANCH
        });

        const mangas = await Promise.all(
          files
            .filter(file => file.name.endsWith('.json'))
            .map(async (file) => {
              const { data } = await octokit.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: file.path,
                ref: BRANCH
              });
              return JSON.parse(Buffer.from(data.content, 'base64').toString());
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
