import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Paper } from '@mui/material';
import { logoutUser } from './../../reduxcomponents/slices/tokenSlice';
import { removeConfigData } from '../../reduxcomponents/slices/configSlice';

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(logoutUser());
    dispatch(removeConfigData());
  }, [dispatch]);

//   const backToLogin = () => {
//     ne
//   }

  return (
        <Container 
        component="main" 
        maxWidth="xs" 
            //   className='login-container'
        style={{ 
            position: 'absolute', 
            top: '50%', 
            right: '10%', 
            transform: 'translateY(-50%)' 
        }}
        >
        <Paper 
            elevation={3} 
            // className='login-paper'
            style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255, 255, 255, 0.5)', // Transparent background
                backdropFilter: 'blur(10px)' // Optional: adds a blur effect to the background
            }}
        >
            <Typography variant="h5" align="center">
                Logout
            </Typography>
            <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: '16px' }}
                onClick={() => navigate('/')}
            >
                Back to Login
            </Button>
        </Paper>
        </Container>
    );
};

export default Logout;
