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
    // ... (unchanged)
  };

  const handleStepResult = (index, status) => {
    // ... (unchanged)
  };

  const handleActualResultChange = (index, value) => {
    // ... (unchanged)
  };

  const handleCreateExecution = async () => {
    // ... (unchanged)
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
        {/* ... (unchanged) */}
      </AppBar>

      <Card variant="outlined" style={{ padding: 20, marginTop: 20 }}>
        {/* ... (unchanged) */}

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
            <Button
              startIcon={<MenuIcon />}
              onClick={() => handleStepResult(index, stepResults[index].status === 'PASS' ? 'FAIL' : 'PASS')}
              color={stepResults[index].status === 'PASS' ? 'primary' : 'error'}>
              {stepResults[index].status || 'Set Result'}
            </Button>
          </Card>
        ))}

        {/* ... (unchanged) */}
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