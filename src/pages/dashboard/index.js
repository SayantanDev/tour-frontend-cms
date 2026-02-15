import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import TotalQuiry from '../../components/dashbord/totalQuiry';
import TotalInquiry from '../../components/dashbord/totalInquiry';
import PlacePackageSummary from '../../components/dashbord/PlacePackageSummary';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WavingHandIcon from '@mui/icons-material/WavingHand';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <Box
      className="fade-in"
      sx={{
        minHeight: 'calc(100vh - 100px)',
        px: { xs: 2, md: 3 },
        py: 3,
      }}
    >

      {/* Queries Section */}
      <Box sx={{ mb: 4 }}>
        <TotalQuiry />
      </Box>

      {/* Inquiries Section */}
      <Box sx={{ mb: 4 }}>
        <TotalInquiry />
      </Box>

      {/* Places & Packages Summary */}
      <PlacePackageSummary />
    </Box>
  );
};

export default Dashboard;
