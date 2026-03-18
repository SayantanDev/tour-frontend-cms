import React, { useState } from 'react';
import {
    Paper, Box, Typography, Button, Grid, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem, Chip, Stack, IconButton, List, ListItem, ListItemText, Collapse, Checkbox, FormControlLabel, Divider
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
    carSeason,
    handleCarSeasonChange,
    handleCarDetailsChange,
    handleOptionalExtraToggle
}) => {
    const SIKKIM_EXTRAS = [
        { id: 'nathula', name: 'Nathu la', price: 4500, detail: 'With Tsongmo Lake' },
        { id: 'kalapatthar', name: 'Kala Patthar', price: 3000, detail: 'With Gurudongmar Lake' },
        { id: 'zeropoint', name: 'Zero Point', price: 4000, detail: 'with Yumthang Valley' },
        { id: 'mtkatao', name: 'Mt Katao', price: 3000, detail: 'on Lachung to Gangtok day' },
        { id: 'namchi', name: 'Namchi and Ravangla', price: 3000, detail: 'On Gangtok to Pelling day' }
    ];
    const [isExpanded, setIsExpanded] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    // Helper function to get car count for a specific car type
    const getCarCount = (carName) => {
        const car = tripDetails.car_details?.find(c => c.car_name === carName);
        return car ? car.car_count : 0;
    };

    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isExpanded ? 3 : 0 }}>
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
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                        Trip Details
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {tripDetails.location && <Chip label={`Location: ${tripDetails.location}`} size="small" sx={{ borderColor: '#2196f3', color: '#1976d2', fontWeight: 500 }} variant="outlined" />}
                        <Chip
                            label={`Package: ${selectedPackage?.label || 'Custom Package'}`}
                            size="small"
                            sx={{ borderColor: '#ff9800', color: '#ed6c02', fontWeight: 500 }}
                            variant="outlined"
                        />
                        {carSeason && <Chip label={`Car Season: ${carSeason === 'off_season_price' ? 'Off Season' : 'Season'}`} size="small" sx={{ borderColor: '#00bcd4', color: '#0097a7', fontWeight: 500 }} variant="outlined" />}
                        {tripDetails.car_details?.filter(car => car.car_count > 0).map((car, idx) => (
                            <Chip key={idx} label={`${car.car_name}: ${car.car_count}`} size="small" sx={{ borderColor: '#4caf50', color: '#2e7d32', fontWeight: 500 }} variant="outlined" />
                        ))}
                        {tripDetails.duration > 0 && <Chip label={`${tripDetails.duration} Nights & ${parseInt(tripDetails.duration) + 1} Days`} size="small" sx={{ borderColor: '#2196f3', color: '#1976d2', fontWeight: 500 }} variant="outlined" />}
                    </Stack>
                </Box>
                <Button
                    size="small"
                    color="warning"
                    onClick={onReset}
                    sx={{ fontWeight: 600, letterSpacing: '0.5px' }}
                >
                    RESET
                </Button>
            </Box>
            <Collapse in={isExpanded}>
                <Grid container spacing={2.5}>
                    {/* Location and Package Row */}
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

                    {/* Car Season Row */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Car Season</InputLabel>
                            <Select
                                value={carSeason}
                                label="Car Season"
                                onChange={handleCarSeasonChange}
                            >
                                <MenuItem value="off_season_price">Off Season</MenuItem>
                                <MenuItem value="season_price">Season</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        {/* Space placeholder for alignment with previous 3-column layout if needed, or leave empty if north sikkim is removed */}
                    </Grid>

                    {/* Vehicles Selection Row */}
                    <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Vehicles</InputLabel>
                            <Select
                                value=""
                                label="Select Vehicles"
                                disabled={!carSeason}
                                displayEmpty
                                renderValue={() => {
                                    const selectedCars = tripDetails.car_details?.filter(car => car.car_count > 0) || [];
                                    if (selectedCars.length === 0) return 'No vehicles selected';
                                    return (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selectedCars.map((car, i) => (
                                                <Chip
                                                    key={i}
                                                    label={`${car.car_name} × ${car.car_count}`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    );
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
                                {configData?.additionalCosts?.car
                                    ?.filter(car => {
                                        const isLandRoverPkg = selectedPackage?.label?.toLowerCase().includes("land rover");
                                        const isLandRoverCar = car.type?.toLowerCase().includes("land rover");
                                        return isLandRoverPkg ? isLandRoverCar : !isLandRoverCar;
                                    })
                                    ?.map((car, index) => {
                                        const count = getCarCount(car.type);
                                        const isSelected = count > 0;
                                        const backgroundColor = isSelected ? 'rgba(0, 255, 0, 0.05)' : 'transparent';

                                        return (
                                            <MenuItem
                                                key={index}
                                                value={car.type}
                                                sx={{
                                                    backgroundColor,
                                                    borderBottom: '1px solid #f0f0f0',
                                                    py: 1,
                                                    px: 2,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
                                                    {(user?.permission === 'Admin') && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {(() => {
                                                                if (!carSeason) return 'Select season to view price';
                                                                if (tripDetails.location === 'Darjeeling') {
                                                                    if (car.type === 'Bolero') return `Price: ₹${carSeason === 'off_season_price' ? 3500 : 4000}`;
                                                                    if (car.type === 'Innova') return `Price: ₹${carSeason === 'off_season_price' ? 4000 : 4500}`;
                                                                }
                                                                return `Price: ₹${car.cost?.[carSeason] || 0}`;
                                                            })()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        disabled={!carSeason || count <= 0}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCarDetailsChange(car.type, count - 1);
                                                        }}
                                                        sx={{
                                                            border: '1px solid #ffcdd2',
                                                            color: '#f44336',
                                                            '&:hover': { backgroundColor: '#ffebee' },
                                                            '&:disabled': { opacity: 0.5, border: '1px solid #eee' }
                                                        }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700, color: '#333' }}>
                                                        {count}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        disabled={!carSeason}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCarDetailsChange(car.type, count + 1);
                                                        }}
                                                        sx={{
                                                            border: '1px solid #c8e6c9',
                                                            color: '#4caf50',
                                                            '&:hover': { backgroundColor: '#e8f5e9' },
                                                            '&:disabled': { opacity: 0.5, border: '1px solid #eee' }
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

                    {/* Travel Date and Duration Row */}
                    < Grid item xs={12} md={6} >
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
                    </Grid >
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Duration (Nights)"
                            name="duration"
                            type="number"
                            value={tripDetails.duration}
                            onChange={handleTripDetailsChange}
                            inputProps={{ min: 0 }}
                        />
                    </Grid>

                    {/* Rooms and Hotel Type Row */}
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
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Room Type</InputLabel>
                            <Select
                                name="room_type"
                                value={stayInfo.room_type || ""}
                                onChange={handleStayInfoChange}
                                label="Room Type"
                            >
                                {["Standard", "Deluxe", "Super Deluxe", "Luxury", "Suite", "Family Room"].map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Pickup and Dropoff Row */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Pickup Location"
                            name="pickup_location"
                            value={tripDetails.pickup_location || ''}
                            onChange={handleTripDetailsChange}
                            placeholder="NJP / IXB"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Dropoff Location"
                            name="dropoff_location"
                            value={tripDetails.dropoff_location || ''}
                            onChange={handleTripDetailsChange}
                            placeholder="NJP / IXB"
                        />
                    </Grid>
                    {(tripDetails?.location?.toLowerCase() === 'sikkim' || tripDetails?.location?.toLowerCase()?.includes('sikkim')) && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1976d2' }}>
                                Optional Extras (Sikkim)
                            </Typography>
                            <Grid container spacing={1}>
                                {SIKKIM_EXTRAS.map((extra) => {
                                    const isSelected = (tripDetails.optional_extras || []).some(e => {
                                        const storedName = typeof e === 'object' ? (e.name || '') : e;
                                        return (storedName || '').toLowerCase().trim() === extra.name.toLowerCase().trim();
                                    });
                                    return (
                                        <Grid item xs={12} sm={6} md={3} key={extra.id}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={isSelected}
                                                        onChange={() => handleOptionalExtraToggle(extra.name, extra.price)}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {extra.name} (₹{extra.price.toLocaleString()}/-)
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {extra.detail}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                        </Grid>
                    )}

                    {/* Keywords Row */}
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
                </Grid >
            </Collapse >
        </Paper >
    );
};

export default TripDetailsCard;
