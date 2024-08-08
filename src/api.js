import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2RpZ2l0YWwtc29sdXRpb25zLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjYzZDY0ZjQ5ZGI0ZjcxNWM5NzFlYmNhOCJ9fSwiaXNzIjoiY29tLmthbm9haC50ZXN0LW1hbmFnZXIiLCJzdWIiOiI0NjI1NDUyOC1kYjI4LTNiMTgtOGRkMi03ZGJjMmY2NWYzYjUiLCJleHAiOjE3NTI4MDQ0MjgsImlhdCI6MTcyMTI2ODQyOH0.AICGUijQnZLEfbpvd78f02PkEs8BP3hsKJLZ8R9vXFU`
  }
});

api.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
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
    const response = await api.post('/jira/issue', bugData);
    return response.data;
  } catch (error) {
    console.error('Error creating Jira bug:', error);
    throw new Error('Failed to create Jira bug due to server error');
  }
};