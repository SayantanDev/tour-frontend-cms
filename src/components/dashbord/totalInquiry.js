import React, { useEffect, useState } from 'react'
import { getAllInquiries } from '../../api/inquiryAPI';
import { Card, CardContent, Typography, Box } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

function TotalInquiry() {
 // const [inquiries, setInquiries] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filteredInquiries, setFilteredInquiries] = useState([]);
 // console.log("filteredInquiries is :",filteredInquiries);


 useEffect(() => {
  const fetchInquiries = async () => {
   try {
    const response = await getAllInquiries(); // Replace with actual API endpoint
    const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // setInquiries(sortedData);
    setFilteredInquiries(sortedData);
   } catch (error) {
    console.error("Error fetching inquiries:", error);
   } finally {
    setLoading(false);
   }
  };
  fetchInquiries();
 }, []);
 return (
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
     sx={{
      height: '100%',
      width: '100%',
      textAlign: 'center',
      
     }}
    >
     <Typography variant="body1" color="text.secondary">
      Total Inquiries
     </Typography>
     <Typography variant="h6" fontWeight="bold" color="primary">
      {filteredInquiries.length}
     </Typography>
    </Box>
   </CardContent>
  </Card>

 )
}

export default TotalInquiry
