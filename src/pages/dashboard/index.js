import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, IconButton, Tooltip, CircularProgress } from '@mui/material';
import TotalQuiry from '../../components/dashbord/totalQuiry';
import TotalInquiry from '../../components/dashbord/totalInquiry';
import PlacePackageSummary from '../../components/dashbord/PlacePackageSummary';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import RefreshIcon from '@mui/icons-material/Refresh';
import useAppData from '../../hooks/useAppData';

const Dashboard = () => {

  // Use centralized data hook
  const { isLoading, refreshAllData } = useAppData({ autoFetch: false });

  const handleRefresh = async () => {
    await refreshAllData();
  };

  return (
    <Box
      className="fade-in"
      sx={{
        minHeight: 'calc(100vh - 100px)',
        px: { xs: 2, md: 3 },
        py: 3,
      }}
    >
      {/* Welcome Header */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <DashboardIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>
                    Welcome Back
                  </Typography>
                  <WavingHandIcon sx={{ fontSize: 32, color: '#FFD700' }} />
                </Box>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Here's what's happening with your tour operations today
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                disabled={isLoading}
                sx={{
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

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

