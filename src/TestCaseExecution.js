import React, { useState } from 'react';
import { Container, TextField, Button, Card, Typography, CircularProgress, AppBar, Toolbar, IconButton, Box, Modal, Fade } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState('');

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
      const status = stepResults.some(step => step.status === 'FAIL') ? 'FAIL' : (stepResults.some(step => step.status === 'BLOCKED') ? 'BLOCKED' : 'PASS');
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

  const handleOpenModal = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
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
          <Button startIcon={<SearchIcon />} variant="contained" color="primary" onClick={handleFetchTestCase}>
            Fetch Test Case
          </Button>
        )}

        {error && <Typography color="error">{error}</Typography>}

        {testCase && testCase.steps.map((step, index) => (
          <Card key={index} variant="outlined" style={{ margin: '10px 0', padding: '10px' }}>
            <Typography variant="h6">Step {index + 1}</Typography>
            <Typography><strong>Description:</strong> {step.inline.description}</Typography>
            <Typography><strong>Test Data:</strong> {step.inline.testData}</Typography>
            <Typography><strong>Expected Result:</strong> {step.inline.expectedResult}</Typography>
            <TextField
              fullWidth
              label="Actual Result"
              value={stepResults[index].actualResult}
              onChange={(e) => handleActualResultChange(index, e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <Button startIcon={<MenuIcon />} onClick={() => handleStepResult(index, 'PASS')} color={stepResults[index].status === 'PASS' ? 'primary' : 'default'}>
              Pass
            </Button>
            <Button startIcon={<MenuIcon />} onClick={() => handleStepResult(index, 'FAIL')} color={stepResults[index].status === 'FAIL' ? 'error' : 'default'}>
              Fail
            </Button>
            <Button startIcon={<MenuIcon />} onClick={() => handleStepResult(index, 'BLOCKED')} color={stepResults[index].status === 'BLOCKED' ? 'secondary' : 'default'}>
              Blocked
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
        <Button startIcon={<PlayArrowIcon />} variant="contained" color="primary" onClick={handleCreateExecution} disabled={!projectKey || !testCycleKey}>
          Create Test Execution
        </Button>
      </Card>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={modalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}>
            <img src={enlargedImageUrl} alt="Enlarged view" style={{ width: '100%', height: 'auto' }} />
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default TestCaseExecution;