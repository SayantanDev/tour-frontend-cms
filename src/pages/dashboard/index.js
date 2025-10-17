import React from 'react';
import TotalInquiry from '../../components/dashbord/totalInquiry';
import TotalQuiry from '../../components/dashbord/totalQuiry';
import { Box } from '@mui/material';
import PlacePackageSummary from '../../components/dashbord/PlacePackageSummary';

const Dashboard = () => {


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 2,  
        px: 2,
        mt: 0,
        flexWrap: 'wrap',  
      }}
    >
      <TotalQuiry />
      <TotalInquiry />
      <PlacePackageSummary />
    </Box>
  );
};

export default Dashboard;
