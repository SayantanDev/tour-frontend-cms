import React, { useEffect, useState } from 'react'
import { getAllQueries } from "../../api/queriesAPI";
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';


function TotalQuiry() {
  // const [query, setQuery] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState([]);
  // const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuery = async () => {
      try {
        const response = await getAllQueries();
        const sortedData = response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        // setQuery(sortedData);
        setFilteredQuery(sortedData);
      } catch (error) {
        console.error("Error fetching query:", error);
      } finally {
        // setLoading(false);
      }
    };
    fetchQuery();
  }, []);
  const confirm = filteredQuery.filter(q => q.lead_stage === "Confirm");
  const New = filteredQuery.filter(q => q.lead_stage === "New");
  const postpond = filteredQuery.filter(q => q.lead_stage === "Postponed");
  const cancle = filteredQuery.filter(q => q.lead_stage === "Cancel");

  const renderCard = (label, count, icon, color) => (
    <Card
      sx={{
        width: '10vw',
        minWidth: 120,
        height: 100,
        borderRadius: '12px',
        boxShadow: 3,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <CardContent sx={{ p: 0, width: '100%', height: '100%' }}>
        <Box sx={{ height: '100%', width: '100%', textAlign: 'center' }}>
          <Box>{icon}</Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={color}>
            {count}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Quiries Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item>{renderCard('Total', filteredQuery.length, <NotificationsActiveIcon color="primary" />, 'primary')}</Grid>
        <Grid item>{renderCard('Confirmed', confirm.length, <CheckCircleIcon color="success" />, 'success.main')}</Grid>
        <Grid item>{renderCard('New', New.length, <NewReleasesIcon color="info" />, 'info.main')}</Grid>
        <Grid item>{renderCard('Postpond', postpond.length, <PauseCircleIcon color="warning" />, 'warning.main')}</Grid>
        <Grid item>{renderCard('Cancelled', cancle.length, <CancelIcon color="error" />, 'error.main')}</Grid>
      </Grid>
    </>

  )
}

export default TotalQuiry
