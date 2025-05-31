import React, { useEffect, useState } from 'react';
import { getAllInquiries } from '../../api/inquiryAPI';
import {
 Card, CardContent, Typography, Box,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const TotalInquiry = () => {
 const [filteredInquiries, setFilteredInquiries] = useState([]);
//  const [loading, setLoading] = useState(true);

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
    // setLoading(false);
   }
  };
  fetchInquiries();
 }, []);

 return (
  <>
  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Inquiries Summary</Typography>
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
    <Box
    sx={{ height: '100%', width: '100%', textAlign: 'center' }}
    >
     <NotificationsActiveIcon color="primary" />
     <Typography variant="body2" color="text.secondary">
      Total Inquiries
     </Typography>
     <Typography variant="h6" fontWeight="bold" color="primary">
      {filteredInquiries.length}
     </Typography>
    </Box>
   </CardContent>
  </Card>
  </>
 );
};

export default TotalInquiry;
