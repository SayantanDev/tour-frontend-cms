// hooks/useSnackbar.js
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Snackbar, Alert } from '@mui/material';

const useSnackbar = () => {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message, severity = 'info') => {
    setState({ open: true, message, severity });
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  };

  const SnackbarComponent = () =>
    createPortal(
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={state.severity} variant="filled">
          {state.message}
        </Alert>
      </Snackbar>,
      document.body
    );

  return {
    showSnackbar,
    SnackbarComponent,
  };
};

export default useSnackbar;
