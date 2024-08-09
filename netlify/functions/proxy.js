const axios = require('axios');
const FormData = require('form-data');
const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const JIRA_API_URL = 'https://digital-solutions.atlassian.net/rest/api/2';
const API_TOKEN = process.env.REACT_APP_API_TOKEN;
const JIRA_API_TOKEN = process.env.REACT_APP_JIRA_API_TOKEN;
const JIRA_EMAIL = process.env.REACT_APP_JIRA_EMAIL;

exports.handler = async (event) => {
  const path = event.path.replace(/^\/api/, '');
  const url = path.startsWith('/jira/') ? `${JIRA_API_URL}${path.replace('/jira', '')}` : `${API_BASE_URL}${path}`;

  try {
    let headers = {
      'Content-Type': 'application/json'
    };

    // Pass through the Authorization header from the client
    if (event.headers['Authorization']) {
      headers['Authorization'] = event.headers['Authorization'];
    }

    // Only set the Authorization header if it wasn't provided by the client
    if (!headers['Authorization']) {
      headers['Authorization'] = path.startsWith('/jira/') 
        ? `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}` 
        : `Bearer ${API_TOKEN}`;
    }

    let data;

    if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
      const form = new FormData();
      const busboy = require('busboy');
      const bb = busboy({ headers: event.headers });

      await new Promise((resolve, reject) => {
        bb.on('file', (name, file, info) => {
          const { filename, encoding, mimeType } = info;
          form.append(name, file, { filename, contentType: mimeType, knownLength: file.truncated });
        });

        bb.on('field', (name, val, info) => {
          form.append(name, val);
        });

        bb.on('finish', () => {
          data = form;
          headers = {
            ...headers,
            ...form.getHeaders(),
          };
          resolve();
        });

        bb.write(event.body);
        bb.end();
      });
    } else {
      data = event.body ? JSON.parse(event.body) : undefined;
    }

    const response = await axios({
      method: event.httpMethod,
      url: url,
      headers: headers,
      params: event.queryStringParameters,
      data: data
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify(error.response ? error.response.data : { message: 'Internal Server Error' })
    };
  }
};