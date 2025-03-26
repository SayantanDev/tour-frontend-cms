import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from '@mui/material';
import backgroundImage from '../../assets/images/sandakphu.jpg';

const RootLayout = () => {
  
  return (
    
    <Box
      sx={{
        height: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Outlet />
    </Box>
  );
}

export default RootLayout;