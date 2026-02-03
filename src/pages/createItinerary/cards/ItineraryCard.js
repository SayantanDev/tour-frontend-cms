import React from 'react';
import { Paper, Typography, Box, Grid, TextField } from '@mui/material';

const ItineraryCard = ({ itinerary, onItineraryChange }) => {
    if (!itinerary || itinerary.length === 0) return null;

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Short Itinerary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {itinerary.map((day, index) => (
                    <Grid container key={index} alignItems="flex-start" spacing={2}>
                        <Grid item xs={12} md={2} sx={{ pt: '24px !important' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Day {index + 1} :
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={10}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                value={day}
                                onChange={(e) => onItineraryChange(index, e.target.value)}
                                placeholder={`Enter details for Day ${index + 1}`}
                            />
                        </Grid>
                    </Grid>
                ))}
            </Box>
        </Paper>
    );
};

export default ItineraryCard;
