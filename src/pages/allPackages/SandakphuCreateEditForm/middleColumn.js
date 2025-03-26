import React from "react";
import { Button, Box, Grid } from '@mui/material';

const MiddleColumn = ({setClickedButton, clickedButton}) => {
    const buttonNames = [
        "Header",
        "Overview",
        "S. Itinerary",
        "Itinerary",
        "Reach",
        "Cost",
        "Carry"
    ];
    const buttonColors = [
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
        "default"
    ];
    
    return (
        <Grid item xs={2}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                spacing={2}
                sx={{ padding: 2 }}
                >
                {buttonNames.map((name, index) => (
                    <Button
                    key={name}
                    variant="contained"
                    color={buttonColors[index % buttonColors.length]}
                    onClick={() => setClickedButton(name)}
                    sx={{ marginBottom: 1 }}
                    >
                    {name}
                    </Button>
                ))}
            </Box>
        </Grid>
    );
}
  
export default MiddleColumn;