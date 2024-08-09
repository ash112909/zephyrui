import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  if (request.url.startsWith('/jira/')) {
    request.headers['Authorization'] = `Basic ${btoa(`${process.env.REACT_APP_JIRA_EMAIL}:${process.env.REACT_APP_JIRA_API_TOKEN}`)}`;
  } else {
    request.headers['Authorization'] = `Bearer ${process.env.REACT_APP_API_TOKEN}`;
  }
  return request;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

export const getTestCase = async (testCaseKey) => {
  try {
    const [testCaseResponse, testStepsResponse] = await Promise.all([
      api.get(`/testcases/${testCaseKey}`),
      api.get(`/testcases/${testCaseKey}/teststeps?maxResults=1000`)
    ]);
    return {
      ...testCaseResponse.data,
      steps: testStepsResponse.data.values
    };
  } catch (error) {
    console.error('Error fetching test case:', error);
    throw error;
  }
};

export const createTestExecution = async (executionData) => {
  try {
    const response = await api.post('/testexecutions', executionData);
    return response.data;
  } catch (error) {
    console.error('Error creating test execution:', error);
    throw new Error('Failed to create test execution due to server error');
  }
};

export const updateTestExecutionSteps = async (testExecutionId, stepResults) => {
  try {
    const payload = {
      steps: stepResults,
    };
    const response = await api.put(`/testexecutions/${testExecutionId}/teststeps`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating test execution steps:', error);
    throw new Error('Failed to update test execution steps due to server error');
  }
};

export const updateExecutionStatus = async (testExecutionId, status) => {
  try {
    const payload = {
      status: status
    };
    const response = await api.put(`/testexecutions/${testExecutionId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating test execution status:', error);
    throw new Error('Failed to update test execution status due to server error');
  }
};

export const createJiraBug = async (bugData) => {
  try {
    const payload = {
      fields: {
        project: {
          key: bugData.projectKey
        },
        summary: bugData.summary,
        issuetype: {
          name: bugData.issueType
        },
        description: createDescription(bugData),
        priority: {
          name: bugData.priority
        }
      }
    };
    
    console.log('Jira bug creation payload:', JSON.stringify(payload, null, 2));
    
    const response = await api.post('/jira/issue', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating Jira bug:', error);
    throw error;
  }
};

function createDescription(bugData) {
  return `
Test Case Key: ${bugData.testCaseKey}
Step Description: ${bugData.stepDescription}
Expected Result: ${bugData.expectedResult}
Actual Result: ${bugData.actualResult}

${bugData.description}
  `.trim();
}