import React from 'react';
import {
    Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, TextField, Autocomplete
} from '@mui/material';

const HotelSelectionCard = ({
    tripDetails,
    allHotels,
    hotelSelections,
    season,
    handleSeasonChange,
    handleHotelReset,
    selectedDay,
    setSelectedDay,
    handleHotelChange
}) => {
    if (!tripDetails.duration || tripDetails.duration <= 0 || allHotels.length === 0) return null;

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Select Hotels Day-Wise
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Season</InputLabel>
                        <Select
                            value={season}
                            label="Season"
                            onChange={handleSeasonChange}
                        >
                            <MenuItem value="off_season_price">Off Season</MenuItem>
                            <MenuItem value="season_price">Season</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        size="small"
                        color="warning"
                        onClick={handleHotelReset}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Array.from({ length: parseInt(tripDetails.duration) }, (_, dayIndex) => (
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
                                        helperText="Location from package"
                                        size="small"
                                        disabled={!season}
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
                                        renderInput={(params) => <TextField {...params} label="Select Hotel" />}
                                        disabled={!season}
                                    />
                                </Grid>

                                {/* Step 3: Room Type */}
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small" disabled={!season || allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId)?.type === 'Homestay'}>
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
                                    <FormControl fullWidth size="small" disabled={!season}>
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
                                <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Hotel Name:</strong>{' '}
                                        {allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId)?.hotel_name || 'N/A'}
                                        {hotelSelections[dayIndex]?.roomType && (
                                            <>
                                                {' | '}<strong>Room Type:</strong> {hotelSelections[dayIndex].roomType}
                                            </>
                                        )}
                                        {hotelSelections[dayIndex]?.mealPlan && (
                                            <>
                                                {' | '}<strong>Meal Plan:</strong> {hotelSelections[dayIndex].mealPlan}
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default HotelSelectionCard;
