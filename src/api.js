import axios from 'axios';

// Create an instance of axios with predefined base settings
const api = axios.create({
  baseURL: '/api', // Adjust this according to your server configuration
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}` // Using environment variable for security
  }
});

// Request interceptor to log and handle requests uniformly
api.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify(request, null, 2))
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
