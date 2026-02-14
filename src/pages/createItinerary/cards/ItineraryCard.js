import React, { useMemo } from 'react';
import { Paper, Typography, Box, Grid, TextField, Button, Autocomplete } from '@mui/material';

const ItineraryCard = ({ itinerary, onItineraryChange, allPackages, onAddDay, onRemoveDay }) => {

    // Extract unique itinerary descriptions for autocomplete
    const uniqueItineraryOptions = useMemo(() => {
        const options = new Set();
        if (allPackages && Array.isArray(allPackages)) {
            allPackages.forEach(pkg => {
                if (pkg.details?.shortItinerary && Array.isArray(pkg.details.shortItinerary)) {
                    pkg.details.shortItinerary.forEach(item => {
                        const text = typeof item === 'string' ? item : (item.tagValue || item.tagName || '');
                        if (text && text.trim().length > 0) {
                            options.add(text.trim());
                        }
                    });
                }
            });
        }
        return Array.from(options);
    }, [allPackages]);

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
                            <Autocomplete
                                freeSolo
                                size="small"
                                openOnFocus={false}
                                options={uniqueItineraryOptions}
                                value={day}
                                onInputChange={(event, newInputValue) => {
                                    onItineraryChange(index, newInputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        multiline
                                        minRows={1}
                                        placeholder={`Enter details for Day ${index + 1}`}
                                    />
                                )}
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
