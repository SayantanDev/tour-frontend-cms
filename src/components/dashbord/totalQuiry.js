import React, { useEffect, useState } from 'react'
import { getAllQueries } from "../../api/queriesAPI";
import { Card, CardContent, Typography, Box, Grid, Skeleton } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';


function TotalQuiry() {
  const [filteredQuery, setFilteredQuery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuery = async () => {
      try {
        const response = await getAllQueries();
        const sortedData = response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setFilteredQuery(sortedData);
      } catch (error) {
        console.error("Error fetching query:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchQuery();
  }, []);

  const confirm = filteredQuery.filter(q => q.lead_stage === "Confirm");
  const New = filteredQuery.filter(q => q.lead_stage === "New");
  const postpond = filteredQuery.filter(q => q.lead_stage === "Postponed");
  const cancle = filteredQuery.filter(q => q.lead_stage === "Cancel");

  const renderCard = (label, count, icon, gradient, iconBg) => (
    <Card
      className="fade-in"
      sx={{
        width: '10vw',
        minWidth: 160,
        height: 120,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
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
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        },
      }}
    >
      {loading ? (
        <Skeleton variant='rounded' width="100%" height="100%" />
      ) : (
        <CardContent sx={{ p: 0, width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
          <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Box
              sx={{
                mb: 1,
                p: 1.5,
                borderRadius: 2,
                background: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              {count}
            </Typography>
          </Box>
        </CardContent>
      )}
    </Card>
  );

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Queries Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          {renderCard(
            'Total',
            filteredQuery.length,
            <NotificationsActiveIcon sx={{ fontSize: 32, color: '#fff' }} />,
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'rgba(255,255,255,0.2)'
          )}
        </Grid>
        <Grid item>
          {renderCard(
            'Confirmed',
            confirm.length,
            <CheckCircleIcon sx={{ fontSize: 32, color: '#fff' }} />,
            'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            'rgba(255,255,255,0.2)'
          )}
        </Grid>
        <Grid item>
          {renderCard(
            'New',
            New.length,
            <NewReleasesIcon sx={{ fontSize: 32, color: '#fff' }} />,
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'rgba(255,255,255,0.2)'
          )}
        </Grid>
        <Grid item>
          {renderCard(
            'Postponed',
            postpond.length,
            <PauseCircleIcon sx={{ fontSize: 32, color: '#fff' }} />,
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'rgba(255,255,255,0.2)'
          )}
        </Grid>
        <Grid item>
          {renderCard(
            'Cancelled',
            cancle.length,
            <CancelIcon sx={{ fontSize: 32, color: '#fff' }} />,
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'rgba(255,255,255,0.2)'
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default TotalQuiry
