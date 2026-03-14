import { useState } from 'react';
import { useSelector } from "react-redux";
import {
    Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, TextField, Collapse, Chip, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { calculateCarCost } from '../createInquiryCalculation';

const CarSelectionCard = ({
    tripDetails,
    carSelections,
    carSeason,
    handleCarSeasonChange,
    handleCarReset, // You'll need to implement this in parent
    handleCarSelectionChange, // (dayIndex, carName, newCount)
    configData,
    itinerary = []
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { user } = useSelector(state => state.tokens);

    if (!tripDetails.duration || tripDetails.duration <= 0) return null;

    const totalDays = parseInt(tripDetails.duration) + 1;
    const totalCarCost = calculateCarCost(configData, carSeason, tripDetails, carSelections);

    const getCarCountForDay = (dayIndex, carName) => {
        const daySelection = carSelections[dayIndex] || [];
        const car = daySelection.find(c => c.car_name === carName);
        return car ? car.car_count : 0;
    };

    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
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
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                        Select Vehicles Day-Wise
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {carSeason && (
                            <Chip
                                label={`Car Season: ${carSeason === 'off_season_price' ? 'Off Season' : 'Season'}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {(user?.permission === 'Admin' && totalCarCost > 0) && (
                            <Chip
                                label={`Total Car Cost: ₹${totalCarCost.toLocaleString()}`}
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
                    )}
                    <Button
                        size="small"
                        color="warning"
                        onClick={handleCarReset}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>
            <Collapse in={isExpanded}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {Array.from({ length: totalDays }, (_, dayIndex) => {
                        const daySelection = carSelections[dayIndex] || [];
                        const dayCost = calculateCarCost(configData, carSeason, tripDetails, { [dayIndex]: daySelection });

                        return (
                            <Box
                                key={dayIndex}
                                sx={{
                                    p: 2,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    backgroundColor: '#fafafa',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        Day {dayIndex + 1} {itinerary[dayIndex] ? `: ${itinerary[dayIndex]}` : ''}
                                    </Typography>
                                    {dayCost > 0 && (
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Day Cost: ₹{dayCost.toLocaleString()}
                                        </Typography>
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    {configData?.additionalCosts?.car?.map((car, index) => {
                                        const count = getCarCountForDay(dayIndex, car.type);
                                        const isSelected = count > 0;
                                        
                                        return (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: isSelected ? 'primary.main' : '#eee',
                                                    borderRadius: 1,
                                                    bgcolor: isSelected ? 'rgba(33, 150, 243, 0.04)' : 'white'
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {car.type}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ₹{car.cost?.[carSeason] || 0}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleCarSelectionChange(dayIndex, car.type, count - 1)}
                                                            disabled={count <= 0 || !carSeason}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                                                            {count}
                                                        </Typography>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleCarSelectionChange(dayIndex, car.type, count + 1)}
                                                            disabled={!carSeason}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default CarSelectionCard;
