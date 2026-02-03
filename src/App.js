import React from 'react';
import './assets/App.scss';
import Router from './routes';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import DataInitializer from './components/common/DataInitializer';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataInitializer>
        <div className="App">
          <Router />
        </div>
      </DataInitializer>
    </ThemeProvider>
  );
};

export default App;

