import React from 'react';
import {
    Paper, Box, Typography, Button, Grid, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem, Chip, Stack, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

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
    onReset,
    handleLocationChange,
    allPackages,
    onPackageSelect,
    season,
    handleSeasonChange,
    handleCarDetailsChange
}) => {
    // Helper function to get car count for a specific car type
    const getCarCount = (carName) => {
        const car = tripDetails.car_details?.find(c => c.car_name === carName);
        return car ? car.car_count : 0;
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Trip Details
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {tripDetails.location && <Chip label={`Location: ${tripDetails.location}`} size="small" color="primary" variant="outlined" />}
                        <Chip label={`Package: ${selectedPackage?.label || 'Custom Package'}`} size="small" color="primary" variant="outlined" />
                        {season && <Chip label={`Car Season: ${season === 'off_season_price' ? 'Off Season' : 'Season'}`} size="small" color="primary" variant="outlined" />}
                        {tripDetails.car_details?.filter(car => car.car_count > 0).map((car, idx) => (
                            <Chip key={idx} label={`${car.car_name}: ${car.car_count}`} size="small" color="success" variant="outlined" />
                        ))}
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
                        size="small"
                        options={uniqueLocations}
                        value={tripDetails.location}
                        onChange={(e, newValue) => {
                            if (handleLocationChange) {
                                handleLocationChange(newValue);
                            } else {
                                setTripDetails({ ...tripDetails, location: newValue || '', duration: 0 });
                            }
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Location" placeholder="Select location" />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Package</InputLabel>
                        <Select
                            label="Package"
                            value={selectedPackage ? selectedPackage._id : 'custom'}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (onPackageSelect) {
                                    if (val === 'custom') {
                                        onPackageSelect(null);
                                    } else {
                                        const pkg = allPackages?.find(p => p._id === val);
                                        onPackageSelect(pkg);
                                    }
                                }
                            }}
                        >
                            <MenuItem value="custom">Custom Package</MenuItem>
                            {allPackages
                                ?.filter(p => !tripDetails.location || p.location?.toLowerCase() === tripDetails.location?.toLowerCase())
                                .map((pkg) => (
                                    <MenuItem key={pkg._id} value={pkg._id}>
                                        {pkg.label || pkg.name || 'Unnamed Package'}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Season Dropdown */}
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
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
                </Grid>

                {/* Cars Selection with +/- Controls */}
                <Grid item xs={12} md={9}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Select Vehicles</InputLabel>
                        <Select
                            value=""
                            label="Select Vehicles"
                            disabled={!season}
                            renderValue={() => {
                                const selectedCars = tripDetails.car_details?.filter(car => car.car_count > 0) || [];
                                if (selectedCars.length === 0) return 'No vehicles selected';
                                return selectedCars.map(car => `${car.car_name} (${car.car_count})`).join(', ');
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 400,
                                    },
                                },
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                        >
                            {configData?.additionalCosts?.car?.map((car, index) => {
                                const count = getCarCount(car.type);
                                const isSelected = count > 0;
                                const backgroundColor = isSelected ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';

                                return (
                                    <MenuItem
                                        key={index}
                                        value={car.type}
                                        sx={{
                                            backgroundColor,
                                            border: '1px solid',
                                            borderColor: isSelected ? 'rgba(0, 200, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
                                            mb: 0.5,
                                            mx: 1,
                                            borderRadius: 1,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: isSelected ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                                            },
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {car.type}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {season ? `Price: ₹${car.cost?.[season] || 0}` : 'Select season to view price'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                disabled={!season || count <= 0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCarDetailsChange(car.type, count - 1);
                                                }}
                                                sx={{
                                                    backgroundColor: '#f44336',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: '#d32f2f' },
                                                    '&:disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
                                                }}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>
                                                {count}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                disabled={!season}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCarDetailsChange(car.type, count + 1);
                                                }}
                                                sx={{
                                                    backgroundColor: '#4caf50',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: '#388e3c' },
                                                    '&:disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
                                                }}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        size="small"
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
                        size="small"
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
                        size="small"
                        label="Number of Rooms"
                        name="rooms"
                        type="number"
                        value={stayInfo.rooms}
                        onChange={handleStayInfoChange}
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
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
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Keywords"
                        name="keywords"
                        value={tripDetails.keywords}
                        onChange={handleTripDetailsChange}
                        placeholder="e.g., adventure, honeymoon"
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TripDetailsCard;
