import React, { useState } from 'react';
import {
    Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, TextField, Autocomplete, Collapse, Chip, Stack
} from '@mui/material';
import { hotelCostCalculation, calculateSingleHotelCost } from '../createInquiryCalculation';

const HotelSelectionCard = ({
    tripDetails,
    allHotels,
    hotelSelections,
    stayInfo,
    hotelSeason,
    handleHotelSeasonChange,
    handleHotelReset,
    selectedDay,
    setSelectedDay,
    handleHotelChange
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!tripDetails.duration || tripDetails.duration <= 0 || allHotels.length === 0) return null;

    const selectedHotelsCount = Object.values(hotelSelections).filter(h => h.hotelId).length;
    const totalHotelCost = hotelCostCalculation(hotelSelections, allHotels, hotelSeason, tripDetails, stayInfo);

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
                        Select Hotels Day-Wise
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedHotelsCount > 0 && (
                            <Chip
                                label={`Hotels Selected: ${selectedHotelsCount}/${tripDetails.duration}`}
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                        )}
                        {hotelSeason && (
                            <Chip
                                label={`Hotel Season: ${hotelSeason === 'off_season_price' ? 'Off Season' : 'Season'}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {totalHotelCost > 0 && (
                            <Chip
                                label={`Total Hotel Cost: ₹${totalHotelCost.toLocaleString()}`}
                                size="small"
                                color="info"
                                variant="filled"
                            />
                        )}
                    </Stack>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isExpanded && (
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Hotel Season</InputLabel>
                            <Select
                                value={hotelSeason}
                                label="Hotel Season"
                                onChange={handleHotelSeasonChange}
                            >
                                <MenuItem value="off_season_price">Off Season</MenuItem>
                                <MenuItem value="season_price">Season</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    <Button
                        size="small"
                        color="warning"
                        onClick={handleHotelReset}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>
            <Collapse in={isExpanded}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {Array.from({ length: parseInt(tripDetails.duration) }, (_, dayIndex) => {
                        const dayCost = calculateSingleHotelCost(hotelSelections[dayIndex], allHotels, hotelSeason, tripDetails, stayInfo);
                        return (
                            <Box
                                key={dayIndex}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    p: 2,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    backgroundColor: 'transparent',
                                }}
                            >
                                {/* Day Label on Left */}
                                <Box
                                    sx={{
                                        minWidth: 80,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        pt: 2.5
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setSelectedDay(dayIndex)}
                                    >
                                        Day {dayIndex + 1}
                                    </Typography>
                                </Box>

                                {/* Hotel Selection Fields on Right */}
                                <Box sx={{ flex: 1 }}>
                                    <Grid container spacing={2}>
                                        {/* Step 1: Location Selection */}
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                value={hotelSelections[dayIndex]?.location || ''}
                                                onChange={(e) => handleHotelChange(dayIndex, 'location', e.target.value)}
                                                helperText="Location from package"
                                                size="small"
                                                disabled={!hotelSeason}
                                            />
                                        </Grid>

                                        {/* Step 2: Hotel Selection */}
                                        <Grid item xs={12} md={3}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={allHotels}
                                                getOptionLabel={(option) => `${option.hotel_name} (${option.sub_destination || option.location})`}
                                                value={allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId) || null}
                                                onChange={(event, newValue) => {
                                                    handleHotelChange(dayIndex, 'hotelId', newValue?._id || '');
                                                }}
                                                renderInput={(params) => <TextField {...params} label="Select Hotel" size="small" />}
                                                disabled={!hotelSeason}
                                            />
                                        </Grid>

                                        {/* Step 3: Room Type */}
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth size="small" disabled={!hotelSeason || allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId)?.type === 'Homestay'}>
                                                <InputLabel>Room Type</InputLabel>
                                                <Select
                                                    value={hotelSelections[dayIndex]?.roomType || ''}
                                                    label="Room Type"
                                                    onChange={(e) => {
                                                        handleHotelChange(dayIndex, 'roomType', e.target.value);
                                                    }}
                                                >
                                                    {allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId)?.category?.map((cat, index) => (
                                                        <MenuItem key={index} value={cat.room_cat}>{cat.room_cat}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Step 4: Meal Plan */}
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth size="small" disabled={!hotelSeason}>
                                                <InputLabel>Meal Plan</InputLabel>
                                                <Select
                                                    value={hotelSelections[dayIndex]?.mealPlan || ''}
                                                    label="Meal Plan"
                                                    onChange={(e) => {
                                                        handleHotelChange(dayIndex, 'mealPlan', e.target.value);
                                                    }}
                                                >
                                                    <MenuItem value="cp_plan">CP (Breakfast)</MenuItem>
                                                    <MenuItem value="map_plan">MAP (Breakfast + 1 major meal)</MenuItem>
                                                    <MenuItem value="ap_plan">AP (All Meals)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    {/* Selected Hotel Summary */}
                                    {hotelSelections[dayIndex]?.hotelId && (
                                        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">
                                                <strong>Hotel:</strong>{' '}
                                                {allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId)?.hotel_name || 'N/A'}
                                                {hotelSelections[dayIndex]?.roomType && (
                                                    <>{' | '}<strong>Room:</strong> {hotelSelections[dayIndex].roomType}</>
                                                )}
                                                {hotelSelections[dayIndex]?.mealPlan && (
                                                    <>{' | '}<strong>Plan:</strong> {hotelSelections[dayIndex].mealPlan.split('_')[0].toUpperCase()}</>
                                                )}
                                            </Typography>
                                            {dayCost > 0 && (
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                                                    ₹{dayCost.toLocaleString()}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default HotelSelectionCard;
