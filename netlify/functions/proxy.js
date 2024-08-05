const axios = require('axios');

const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2RpZ2l0YWwtc29sdXRpb25zLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjYzZDY0ZjQ5ZGI0ZjcxNWM5NzFlYmNhOCJ9fSwiaXNzIjoiY29tLmthbm9haC50ZXN0LW1hbmFnZXIiLCJzdWIiOiI0NjI1NDUyOC1kYjI4LTNiMTgtOGRkMi03ZGJjMmY2NWYzYjUiLCJleHAiOjE3NTI4MDQ0MjgsImlhdCI6MTcyMTI2ODQyOH0.AICGUijQnZLEfbpvd78f02PkEs8BP3hsKJLZ8R9vXFU';

exports.handler = async (event) => {
  const { path } = event;
  const apiPath = path.replace('/.netlify/functions/proxy', '');
  const url = `${API_BASE_URL}${apiPath}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching data from Zephyr Scale API:', error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify(error.response ? error.response.data : { message: 'Internal Server Error' }),
    };
  }
};
