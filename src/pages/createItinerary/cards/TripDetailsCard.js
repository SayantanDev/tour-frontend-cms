import React from 'react';
import {
    Paper, Box, Typography, Button, Grid, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem, Chip, Stack
} from '@mui/material';

const TripDetailsCard = ({
    tripDetails,
    handleTripDetailsChange,
    setTripDetails,
    selectedPackage,
    stayInfo,
    handleStayInfoChange,
    setStayInfo,
    uniqueLocations,
    snackbar,
    configData,
    onReset
}) => {
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Trip Details
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {tripDetails.location && <Chip label={`Location: ${tripDetails.location}`} size="small" color="primary" variant="outlined" />}
                        <Chip label={`Package: ${selectedPackage?.label || 'Custom Package'}`} size="small" color="primary" variant="outlined" />
                        {tripDetails.car_name && <Chip label={`Car: ${tripDetails.car_name}`} size="small" color="primary" variant="outlined" />}
                        {tripDetails.car_count > 0 && <Chip label={`Count: ${tripDetails.car_count}`} size="small" color="primary" variant="outlined" />}
                        {tripDetails.duration > 0 && <Chip label={`Days: ${tripDetails.duration}`} size="small" color="primary" variant="outlined" />}
                        {stayInfo.rooms > 0 && <Chip label={`Rooms: ${stayInfo.rooms}`} size="small" color="primary" variant="outlined" />}
                        {stayInfo.hotel && <Chip label={`Hotel: ${stayInfo.hotel}`} size="small" color="primary" variant="outlined" />}
                    </Stack>
                </Box>
                <Button
                    size="small"
                    color="warning"
                    onClick={onReset}
                >
                    Reset
                </Button>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Autocomplete
                        options={uniqueLocations}
                        value={tripDetails.location}
                        onChange={(e, newValue) => {
                            setTripDetails({ ...tripDetails, location: newValue || '', duration: 0 });
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Location" placeholder="Select location" />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Keywords"
                        name="keywords"
                        value={tripDetails.keywords}
                        onChange={handleTripDetailsChange}
                        placeholder="e.g., adventure, honeymoon"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Car Type</InputLabel>
                        <Select
                            label="Car Type"
                            name="car_name"
                            value={tripDetails.car_name}
                            onChange={handleTripDetailsChange}
                        >
                            {configData?.additionalCosts?.car?.map((car, index) => (
                                <MenuItem key={index} value={car.type}>
                                    {car.type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Car Count"
                        name="car_count"
                        type="number"
                        value={tripDetails.car_count}
                        onChange={handleTripDetailsChange}
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Travel Date"
                        name="travel_date"
                        type="date"
                        value={tripDetails.travel_date}
                        onChange={handleTripDetailsChange}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Duration (Days)"
                        name="duration"
                        type="number"
                        value={tripDetails.duration}
                        onChange={handleTripDetailsChange}
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Number of Rooms"
                        name="rooms"
                        type="number"
                        value={stayInfo.rooms}
                        onChange={handleStayInfoChange}
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Hotel Type</InputLabel>
                        <Select
                            name="hotel"
                            value={stayInfo.hotel}
                            onChange={handleStayInfoChange}
                            label="Hotel Type"
                        >
                            {configData?.additionalCosts?.hotel?.map((hotelType) => (
                                <MenuItem key={hotelType.type} value={hotelType.type}>
                                    {hotelType.type}
                                </MenuItem>
                            )) || [
                                    <MenuItem key="Budget" value="Budget">Budget</MenuItem>,
                                    <MenuItem key="Standard" value="Standard">Standard</MenuItem>,
                                    <MenuItem key="Premium" value="Premium">Premium</MenuItem>,
                                    <MenuItem key="Luxury" value="Luxury">Luxury</MenuItem>
                                ]}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TripDetailsCard;
