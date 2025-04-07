import React from 'react';
import TotalInquiry from '../../components/dashbord/totalInquiry';
import TotalQuiry from '../../components/dashbord/totalQuiry';
import { Box } from '@mui/material';


const Dashboard = () => {


    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection:"column",
                    gap: 2,            // spacing between cards
                    // alignItems: 'center',
                    justifyContent: 'flex-start', // or 'center'
                    flexWrap: 'wrap', // makes it responsive on small screens
                    mt: 3,
                    px: 2
                }}
            >
                <TotalQuiry />
                <TotalInquiry />
            </Box>
        </>
    );
};

export default Dashboard;