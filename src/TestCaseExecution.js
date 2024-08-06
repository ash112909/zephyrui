import React, { useState } from 'react';
import { Container, TextField, Button, Card, Typography, CircularProgress, AppBar, Toolbar, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getTestCase, createTestExecution, updateTestExecutionSteps } from './api';

const TestCaseExecution = () => {
  const [testCaseKey, setTestCaseKey] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [testCycleKey, setTestCycleKey] = useState('');
  const [testCase, setTestCase] = useState(null);
  const [stepResults, setStepResults] = useState([]);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchTestCase = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedTestCase = await getTestCase(testCaseKey);
      setTestCase(fetchedTestCase);
      if (fetchedTestCase.steps && fetchedTestCase.steps.length > 0) {
        setStepResults(fetchedTestCase.steps.map(step => ({
          status: '',
          actualResult: '',
          description: step.inline.description,
          testData: step.inline.testData,
          expectedResult: step.inline.expectedResult
        })));
      } else {
        setError('Test case steps are not available. Please check the API response.');
      }
    } catch (error) {
      console.error('Error fetching test case:', error);
      setError('Error fetching test case. Please check the key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepResult = (index, status) => {
    const newStepResults = [...stepResults];
    newStepResults[index].status = status;
    setStepResults(newStepResults);
  };

  const handleActualResultChange = (index, value) => {
    const newStepResults = [...stepResults];
    newStepResults[index].actualResult = value;
    setStepResults(newStepResults);
  };

  const handleCreateExecution = async () => {
    setError('');
    try {
      const status = stepResults.some(step => step.status === 'FAIL') ? 'FAIL' : 'PASS';
      const executionData = {
        projectKey,
        testCycleKey,
        testCaseKey,
        statusName: status,
        comment: comments,
      };
      const createdExecution = await createTestExecution(executionData);

      await updateTestExecutionSteps(createdExecution.id, stepResults.map(result => ({
        statusName: result.status,
        actualResult: result.actualResult
      })));

      alert('Test execution created and steps updated successfully!');
    } catch (error) {
      console.error('Error creating test execution or updating steps:', error);
      setError('Error creating test execution or updating steps. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static" style={{ background: '#8B0000' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Test Case Execution
          </Typography>
          <Box sx={{ flexGrow: 0 }}>
            <img src="/boklogo.png" alt="BOK Financial Logo" style={{ height: '48px' }} />
          </Box>
        </Toolbar>
      </AppBar>

      <Card variant="outlined" style={{ padding: 20, marginTop: 20 }}>
        <TextField label="Project Key" value={projectKey} onChange={e => setProjectKey(e.target.value)} fullWidth margin="normal" variant="outlined" />
        <TextField label="Test Cycle Key" value={testCycleKey} onChange={e => setTestCycleKey(e.target.value)} fullWidth margin="normal" variant="outlined" />
        <TextField label="Test Case Key" value={testCaseKey} onChange={e => setTestCaseKey(e.target.value)} fullWidth margin="normal" variant="outlined" />

        {loading ? <CircularProgress /> : (
          <Button startIcon={<MenuIcon />} variant="contained" color="primary" onClick={handleFetchTestCase}>
            Fetch Test Case
          </Button>
        )}

        {error && <Typography color="error">{error}</Typography>}

        {testCase && testCase.steps.map((step, index) => (
          <Card key={index} variant="outlined" style={{ margin: '10px 0', padding: '10px' }}>
            <div dangerouslySetInnerHTML={{ __html: step.description || `Step ${index + 1}` }} />
            <Typography>Test Data: {step.testData}</Typography>
            <Typography>Expected Result: {step.expectedResult}</Typography>
            <TextField
              fullWidth
              label="Actual Result"
              value={stepResults[index].actualResult}
              onChange={(e) => handleActualResultChange(index, e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <Button
              startIcon={<MenuIcon />}
              onClick={() => handleStepResult(index, stepResults[index].status === 'PASS' ? 'FAIL' : 'PASS')}
              color={stepResults[index].status === 'PASS' ? "primary" : "error"}>
              {stepResults[index].status || 'Set Result'}
            </Button>
          </Card>
        ))}

        <TextField
          fullWidth
          label="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          margin="normal"
          variant="outlined"
          multiline
          rows={4}
        />
        <Button startIcon={<MenuIcon />} variant="contained" color="primary" onClick={handleCreateExecution} disabled={!projectKey or !testCycleKey}>
          Create Test Execution
        </Button>
      </Card>
    </Container>
  );
};

export default TestCaseExecution;
