import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, CircularProgress } from '@mui/material';

const JiraBugForm = ({ open, onClose, onSubmit, loading, error }) => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState('');

  const handleSubmit = async () => {
    await onSubmit({ summary, description, parent });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Log Jira Bug
        </Typography>
        <TextField
          fullWidth
          label="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          required
        />
        <TextField
          fullWidth
          label="Parent"
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          margin="normal"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          sx={{ mt: 2 }}
          disabled={loading || !summary || !description}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Bug'}
        </Button>
      </Box>
    </Modal>
  );
};

export default JiraBugForm;