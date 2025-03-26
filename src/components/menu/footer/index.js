import React from "react";
import { Typography, Box } from "@mui/material";

const RootLayout = () => {
    const year = new Date().getFullYear();
    
    return (
        <Box
            component="footer"
            sx={{
                position: 'fixed',
                left: 0,
                bottom: 0,
                width: '100%',
                bgcolor: 'background.paper',
                p: 2,
                textAlign: 'center',
            }}
        >
            <Typography variant="body2" color="text.secondary">
                © {year} | Tour Operation
            </Typography>
        </Box>
    );
}
  
export default RootLayout;