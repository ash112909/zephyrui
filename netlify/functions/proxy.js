const axios = require('axios');
const FormData = require('form-data');
const API_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const JIRA_API_URL = 'https://digital-solutions.atlassian.net/rest/api/2'; // Update this with your Jira URL
const API_TOKEN = process.env.REACT_APP_API_TOKEN;
const JIRA_API_TOKEN = process.env.REACT_APP_JIRA_API_TOKEN;
const JIRA_EMAIL = REACT_APP_JIRA_EMAIL;

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
            project: { key: data.projectKey }, // Replace with your Jira project key
            summary: data.summary,
            description: `${data.description}\n\nTest Case: ${data.testCaseKey}\nStep Description: ${data.stepDescription}\nExpected Result: ${data.expectedResult}\nActual Result: ${data.actualResult}`,
            issuetype: { name: data.issueType || 'Bug' },
            priority: { name: data.priority },
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