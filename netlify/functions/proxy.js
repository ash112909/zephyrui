const axios = require('axios');
const FormData = require('form-data');

const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2RpZ2l0YWwtc29sdXRpb25zLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjYzZDY0ZjQ5ZGI0ZjcxNWM5NzFlYmNhOCJ9fSwiaXNzIjoiY29tLmthbm9haC50ZXN0LW1hbmFnZXIiLCJzdWIiOiI0NjI1NDUyOC1kYjI4LTNiMTgtOGRkMi03ZGJjMmY2NWYzYjUiLCJleHAiOjE3NTI4MDQ0MjgsImlhdCI6MTcyMTI2ODQyOH0.AICGUijQnZLEfbpvd78f02PkEs8BP3hsKJLZ8R9vXFU';

exports.handler = async (event) => {
  const path = event.path.replace(/^\/api/, '');
  const url = `${API_BASE_URL}${path}`;
  
  try {
    let headers = {
      'Authorization': `Bearer ${API_TOKEN}`,
    };
    let data;

    if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
      // Handle file upload
      const boundary = event.headers['content-type'].split('boundary=')[1];
      const form = new FormData();
      
      // Parse the multipart form data
      const parts = event.body.split(`--${boundary}`);
      for (let part of parts) {
        const match = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)(?:\r\n--)/);
        if (match) {
          const [, name, value] = match;
          form.append(name, value.trim());
        }
      }

      headers = form.getHeaders();
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
      data = form;
    } else {
      // Handle JSON data
      headers['Content-Type'] = 'application/json';
      data = event.body ? JSON.parse(event.body) : undefined;
    }

    const result = await axios({
      method: event.httpMethod,
      url: url,
      headers: headers,
      params: event.queryStringParameters,
      data: data
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