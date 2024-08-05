const axios = require('axios');

const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2RpZ2l0YWwtc29sdXRpb25zLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjYzZDY0ZjQ5ZGI0ZjcxNWM5NzFlYmNhOCJ9fSwiaXNzIjoiY29tLmthbm9haC50ZXN0LW1hbmFnZXIiLCJzdWIiOiI0NjI1NDUyOC1kYjI4LTNiMTgtOGRkMi03ZGJjMmY2NWYzYjUiLCJleHAiOjE3NTI4MDQ0MjgsImlhdCI6MTcyMTI2ODQyOH0.AICGUijQnZLEfbpvd78f02PkEs8BP3hsKJLZ8R9vXFU';

exports.handler = async (event) => {
  const path = event.path.replace(/^\/api/, ''); // Ensure path starts directly after '/api'
  const url = `${API_BASE_URL}${path}${event.rawQuery || ''}`; // Append query string if present

  try {
    const result = await axios({
      method: event.httpMethod, // Use the method specified in the request
      url: url,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: event.queryStringParameters, // Pass along query parameters
      data: event.body ? JSON.parse(event.body) : undefined // Pass the body if present
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result.data)
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify(error.response ? error.response.data : { message: 'Internal Server Error' })
    };
  }
};
