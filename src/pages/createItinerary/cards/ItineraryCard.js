import React from 'react';
import { Paper, Typography, Box, Grid, TextField, Button } from '@mui/material';

const ItineraryCard = ({ itinerary, onItineraryChange, onAddDay, onRemoveDay }) => {
    // We render even if empty to show the Add button if needed, but usually it depends on duration.
    // However, for better UX on Custom Package, we might want to return null if empty AND no add/remove control,
    // but here we want to support dynamic adding.
    // If itinerary is explicitly empty (and not just null), we might show nothing or just the add button.

    // Fallback if null
    const safeItinerary = itinerary || [];

    if (safeItinerary.length === 0 && !onAddDay) return null;

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Short Itinerary
                </Typography>
                {onAddDay && (
                    <Button variant="outlined" size="small" onClick={onAddDay}>
                        + Add Day
                    </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {safeItinerary.map((day, index) => (
                    <Grid container key={index} alignItems="flex-start" spacing={2}>
                        <Grid item xs={12} md={2} sx={{ pt: '24px !important' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Day {index + 1} :
                            </Typography>
                        </Grid>
                        <Grid item xs={10} md={9}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                value={day}
                                onChange={(e) => onItineraryChange(index, e.target.value)}
                                placeholder={`Enter details for Day ${index + 1}`}
                            />
                        </Grid>
                        {onRemoveDay && (
                            <Grid item xs={2} md={1} sx={{ display: 'flex', alignItems: 'center', pt: '24px !important' }}>
                                <Button
                                    color="error"
                                    size="small"
                                    onClick={() => onRemoveDay(index)}
                                    sx={{ minWidth: 0 }}
                                >
                                    X
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                ))}
            </Box>
        </Paper>
    );
};

export default ItineraryCard;
