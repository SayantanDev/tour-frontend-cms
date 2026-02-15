import React, { useMemo, useState } from 'react';
import { Paper, Typography, Box, Grid, TextField, Button, Autocomplete, Collapse, Chip, Stack } from '@mui/material';

const ItineraryCard = ({ itinerary, onItineraryChange, allPackages, onAddDay, onRemoveDay }) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isExpanded ? 2 : 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Short Itinerary
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {safeItinerary.length > 0 && (
                            <Chip label={`${safeItinerary.length} Days`} size="small" color="success" variant="outlined" />
                        )}
                    </Stack>
                </Box>
                {onAddDay && (
                    <Button variant="outlined" size="small" onClick={onAddDay}>
                        + Add Day
                    </Button>
                )}
            </Box>
            <Collapse in={isExpanded}>
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
            </Collapse>
        </Paper>
    );
};

export default ItineraryCard;
