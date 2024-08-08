const axios = require('axios');
const FormData = require('form-data');
const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const JIRA_API_URL = 'https://digital-solutions.atlassian.net/rest/api/2'; // Update this with your Jira URL
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2RpZ2l0YWwtc29sdXRpb25zLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjYzZDY0ZjQ5ZGI0ZjcxNWM5NzFlYmNhOCJ9fSwiaXNzIjoiY29tLmthbm9haC50ZXN0LW1hbmFnZXIiLCJzdWIiOiI0NjI1NDUyOC1kYjI4LTNiMTgtOGRkMi03ZGJjMmY2NWYzYjUiLCJleHAiOjE3NTI4MDQ0MjgsImlhdCI6MTcyMTI2ODQyOH0.AICGUijQnZLEfbpvd78f02PkEs8BP3hsKJLZ8R9vXFU';
const JIRA_API_TOKEN = 'ATATT3xFfGF07rwyZ1kP7PKUFpyi_mQSugsAawQTclm1Qyk32mgjMBevkz3pN7iboCvCdW_3jIikdaAN2cAy-RUAM8sC0jsUlUVrlL0zjP19eVomTTc5yYt5vVwc8TIqj39bVlw0RwAjBbExvUcOiBN-Eg6kgX-_zxLUQmhg-TW4VdyzE1yWSbI=B3BCC61D';
const JIRA_EMAIL = 'your-jira-email@example.com'; // Replace with your Jira email

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

    if (event.path === '/api/jira/issue') {
      // Handle Jira issue creation
      const jiraResponse = await axios({
        method: 'POST',
        url: `${JIRA_API_URL}/issue`,
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        data: {
          fields: {
            project: { key: 'YOUR_PROJECT_KEY' }, // Replace with your Jira project key
            summary: data.summary,
            description: `${data.description}\n\nTest Case: ${data.testCaseKey}\nStep Description: ${data.stepDescription}\nExpected Result: ${data.expectedResult}\nActual Result: ${data.actualResult}`,
            issuetype: { name: 'Bug' },
            parent: data.parent ? { key: data.parent } : undefined
          }
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify(jiraResponse.data)
      };
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