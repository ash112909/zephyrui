const axios = require('axios');
const FormData = require('form-data');
const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const API_TOKEN = 'your-api-token';

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
      const form = new FormData();
      
      // Parse the multipart form data
      const busboy = require('busboy');
      const bb = busboy({ headers: event.headers });

      return new Promise((resolve, reject) => {
        bb.on('file', (name, file, info) => {
          const { filename, encoding, mimeType } = info;
          form.append(name, file, filename);
        });

        bb.on('field', (name, val, info) => {
          form.append(name, val);
        });

        bb.on('close', () => {
          headers = {
            ...form.getHeaders(),
            'Authorization': `Bearer ${API_TOKEN}`
          };
          data = form;
          resolve();
        });

        bb.write(Buffer.from(event.body, 'base64'));
        bb.end();
      });
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