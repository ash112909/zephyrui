import React, { useState } from 'react';
import {
  Container, TextField, Button, Card, Typography, CircularProgress, AppBar, Toolbar, 
  IconButton, Box, Modal, Fade
} from '@mui/material';
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
  const [overallStatus, setOverallStatus] = useState('UNEXECUTED');

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
      
      // Determine and set overall status immediately
      const newOverallStatus = determineOverallStatus(newResults);
      setOverallStatus(newOverallStatus);
      console.log('New overall status:', newOverallStatus);
      
      return newResults;
    });
  };

  const handleActualResultChange = (index, value) => {
    const newStepResults = [...stepResults];
    newStepResults[index].actualResult = value;
    setStepResults(newStepResults);
  };

  const determineOverallStatus = (results) => {
    const statusCounts = results.reduce((counts, step) => {
      counts[step.status] = (counts[step.status] || 0) + 1;
      return counts;
    }, {});

    console.log('Status counts:', statusCounts);

    if (statusCounts['BLOCKED'] > 0) return 'BLOCKED';
    if (statusCounts['FAIL'] > 0) return 'FAIL';
    if (statusCounts['PASS'] === results.length) return 'PASS';
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
      console.log('API response:', JSON.stringify(createdExecution, null, 2));

      await updateTestExecutionSteps(createdExecution.id, stepResults.map(result => ({
        statusName: result.status,
        actualResult: result.actualResult
      })));

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
    </Container>
  );
};

export default TestCaseExecution;