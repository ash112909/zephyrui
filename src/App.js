import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TestCaseExecution from './TestCaseExecution';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <TestCaseExecution />
    </ThemeProvider>
  );
}

export default App;
