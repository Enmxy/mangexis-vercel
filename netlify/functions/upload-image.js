exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
    const { image, filename } = JSON.parse(event.body);
    
    // Remove data:image/... prefix
    const base64Image = image.split(',')[1];
    
    // Upload to imgbb (free image hosting)
    const formData = new URLSearchParams();
    formData.append('image', base64Image);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await response.json();

    if (data.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          url: data.data.url,
          display_url: data.data.display_url
        })
      };
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
