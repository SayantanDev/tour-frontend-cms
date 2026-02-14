import React, { useEffect, useState } from 'react';
import { getAllInquiries } from '../../api/inquiryAPI';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

const TotalInquiry = () => {
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await getAllInquiries();
        const sortedData = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setFilteredInquiries(sortedData);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchInquiries();
  }, []);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Inquiries Summary
      </Typography>
      <Card
        className="fade-in"
        sx={{
          width: '10vw',
          minWidth: 160,
          height: 120,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <AssignmentIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 0.5 }}>
                Total Inquiries
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {filteredInquiries.length}
              </Typography>
            </Box>
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default TotalInquiry;
