import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Paper, Box } from '@mui/material';
import { logoutUser } from './../../reduxcomponents/slices/tokenSlice';
import { removeConfigData } from '../../reduxcomponents/slices/configSlice';

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logoutUser());
    dispatch(removeConfigData());
  }, [dispatch]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3, sm: 4 },
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Logout
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Logout;
