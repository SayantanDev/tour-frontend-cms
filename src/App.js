import React from 'react';
import './assets/App.scss';
import Router from './routes';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Router />
      </div>
    </ThemeProvider>
  );
};

export default App;
