import React, { useState } from 'react';
import {
  Container, TextField, Button, Card, Typography, CircularProgress, AppBar, Toolbar, 
  IconButton, Box, Modal, Fade, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { getTestCase, createTestExecution, updateTestExecutionSteps, updateExecutionStatus, createJiraBug } from './api';
import JiraBugForm from './JiraBugForm';

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
  const [overallStatus, setOverallStatus] = useState('UNEXECUTED');
  const [jiraBugModalOpen, setJiraBugModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [jiraBugLoading, setJiraBugLoading] = useState(false);
  const [jiraBugError, setJiraBugError] = useState('');

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
    setStepResults(prevResults => {
      const newResults = [...prevResults];
      newResults[index] = { ...newResults[index], status };
      console.log('Updated step results:', newResults);
      
      const newOverallStatus = determineOverallStatus(newResults);
      setOverallStatus(newOverallStatus);
      console.log('New overall status:', newOverallStatus);
      
      if (status === 'FAIL' || status === 'BLOCKED') {
        setCurrentStepIndex(index);
        setConfirmDialogOpen(true);
      }
      
      return newResults;
    });
  };

  const handleActualResultChange = (index, value) => {
    setStepResults(prevResults => {
      const newResults = [...prevResults];
      newResults[index] = { ...newResults[index], actualResult: value };
      return newResults;
    });
  };

  const determineOverallStatus = (results) => {
    if (results.some(step => step.status === 'BLOCKED')) return 'BLOCKED';
    if (results.some(step => step.status === 'FAIL')) return 'FAIL';
    if (results.every(step => step.status === 'PASS')) return 'PASS';
    return 'UNEXECUTED';
  };

  const handleCreateExecution = async () => {
    setError('');
    try {
      console.log('Final step results:', stepResults);
      console.log('Final overall status:', overallStatus);
      
      const executionData = {
        projectKey,
        testCycleKey,
        testCaseKey,
        statusName: overallStatus,
        comment: comments,
      };
      
      console.log('Execution payload:', JSON.stringify(executionData, null, 2));
      
      const createdExecution = await createTestExecution(executionData);
      console.log('API response for creation:', JSON.stringify(createdExecution, null, 2));

      const stepUpdatePayload = stepResults.map(result => ({
        statusName: result.status,
        actualResult: result.actualResult
      }));
      const updatedSteps = await updateTestExecutionSteps(createdExecution.id, stepUpdatePayload);
      console.log('API response for step update:', JSON.stringify(updatedSteps, null, 2));

      const finalStatusUpdate = await updateExecutionStatus(createdExecution.id, overallStatus);
      console.log('API response for final status update:', JSON.stringify(finalStatusUpdate, null, 2));

      alert('Test execution created and steps updated successfully!');
    } catch (error) {
      console.error('Error creating test execution or updating steps:', error);
      setError('Error in test execution process. Please try again.');
    }
  };

  const handleOpenModal = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmDialog = (confirm) => {
    setConfirmDialogOpen(false);
    if (confirm) {
      setJiraBugModalOpen(true);
    }
  };

  const handleJiraBugSubmit = async (bugData) => {
    setJiraBugLoading(true);
    setJiraBugError('');
    try {
      const step = stepResults[currentStepIndex];
      const bugPayload = {
        ...bugData,
        testCaseKey,
        stepDescription: step.description,
        expectedResult: step.expectedResult,
        actualResult: step.actualResult,
        projectKey: projectKey
      };
      await createJiraBug(bugPayload);
      alert('Jira bug created successfully!');
      setJiraBugModalOpen(false);
    } catch (error) {
      console.error('Error creating Jira bug:', error);
      setJiraBugError('Error creating Jira bug. Please try again.');
    } finally {
      setJiraBugLoading(false);
    }
  };

  const renderInlineContent = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.getElementsByTagName('img');
    
    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {images.length > 0 && (
          <IconButton 
            onClick={() => handleOpenModal(images[0].src)}
            sx={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,255,255,0.7)' }}
          >
            <ZoomInIcon />
          </IconButton>
        )}
      </Box>
    );
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
            <Typography><strong>Description:</strong></Typography>
            {renderInlineContent(step.inline.description)}
            <Typography><strong>Test Data:</strong></Typography>
            {renderInlineContent(step.inline.testData)}
            <Typography><strong>Expected Result:</strong></Typography>
            {renderInlineContent(step.inline.expectedResult)}
            <TextField
              fullWidth
              label="Actual Result"
              value={stepResults[index].actualResult}
              onChange={(e) => handleActualResultChange(index, e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant={stepResults[index].status === 'PASS' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => handleStepResult(index, 'PASS')}
              >
                Pass
              </Button>
              <Button
                variant={stepResults[index].status === 'FAIL' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => handleStepResult(index, 'FAIL')}
              >
                Fail
              </Button>
              <Button
                variant={stepResults[index].status === 'BLOCKED' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => handleStepResult(index, 'BLOCKED')}
              >
                Blocked
              </Button>
            </Box>
          </Card>
        ))}

        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Overall Status: {overallStatus}
        </Typography>

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

        <Button 
          startIcon={<PlayArrowIcon />} 
          variant="contained" 
          color="primary" 
          onClick={handleCreateExecution} 
          disabled={!projectKey || !testCycleKey}
          style={{ marginTop: '20px' }}
        >
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

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Log Jira Bug</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to log a Jira bug for this issue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialog(false)}>No</Button>
          <Button onClick={() => handleConfirmDialog(true)} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      <JiraBugForm
        open={jiraBugModalOpen}
        onClose={() => setJiraBugModalOpen(false)}
        onSubmit={handleJiraBugSubmit}
        loading={jiraBugLoading}
        error={jiraBugError}
      />
    </Container>
  );
};

export default TestCaseExecution;