import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, CircularProgress, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const JiraBugForm = ({ open, onClose, onSubmit, loading, error }) => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('Bug');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = async () => {
    await onSubmit({ summary, description, issueType, priority });
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
        <FormControl fullWidth margin="normal">
          <InputLabel>Issue Type</InputLabel>
          <Select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <MenuItem value="Bug">Bug</MenuItem>
            <MenuItem value="Task">Task</MenuItem>
            <MenuItem value="Story">Story</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="Highest">Highest</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Lowest">
            <MenuItem value="Lowest">Lowest</MenuItem>
          </Select>
        </FormControl>
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