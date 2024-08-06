import React, { useState } from 'react';
import {
  Container, TextField, Button, Card, Typography, CircularProgress, AppBar, Toolbar, 
  IconButton, Box, Modal, Fade
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { getTestCase, createTestExecution, updateTestExecutionSteps, updateExecutionStatus } from './api';

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
      
      const newOverallStatus = determineOverallStatus(newResults);
      setOverallStatus(newOverallStatus);
      console.log('New overall status:', newOverallStatus);
      
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
      
      // First, create the execution with the overall status
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

      // Then, update the steps
      const stepUpdatePayload = stepResults.map(result => ({
        statusName: result.status,
        actualResult: result.actualResult
      }));
      const updatedSteps = await updateTestExecutionSteps(createdExecution.id, stepUpdatePayload);
      console.log('API response for step update:', JSON.stringify(updatedSteps, null, 2));

      // Finally, reinforce the overall status
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

  // ... (rest of the component remains the same)

  return (
    // ... (JSX remains the same)
  );
};

export default TestCaseExecution;