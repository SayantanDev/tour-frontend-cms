import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { Paper, Typography, TextField, Box, Collapse, Grid, Divider } from '@mui/material';
import { hotelCostCalculation, calculateCarCost, calculateSingleHotelCostWithBreakdown } from '../createInquiryCalculation';

const CostEstimateCard = ({
    cost,
    handleCostChange,
    carDetails = [],
    hotelSelections = {},
    allHotels = [],
    stayInfo = {},
    tripDetails = {},
    configData = {},
    season = '',
    duration = 0,
    currentMargin,
    setCurrentMargin
}) => {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [showHotelBreakdown, setShowHotelBreakdown] = useState(false);
    const { user } = useSelector(state => state.tokens);

    const totalDays = (parseInt(duration) || 0) + 1;

    const carTotal = calculateCarCost(carDetails, configData, season, duration);
    const hotelTotal = hotelCostCalculation(hotelSelections, allHotels, season, tripDetails, stayInfo);

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Cost Estimate
                </Typography>
                <TextField
                    size="small"
                    label="Margin (%)"
                    type="number"
                    value={currentMargin}
                    onChange={(e) => {
                        const val = e.target.value;
                        const minMargin = user?.permission === 'Admin' ? 0 : 20;
                        if (val !== '' && parseFloat(val) < minMargin) {
                            setCurrentMargin(minMargin);
                        } else {
                            setCurrentMargin(val);
                        }
                    }}
                    sx={{ width: 100 }}
                    InputProps={{
                        endAdornment: <Typography variant="caption" sx={{ ml: 0.5 }}>%</Typography>,
                    }}
                    inputProps={{
                        min: user?.permission === 'Admin' ? 0 : 20
                    }}
                />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Total Cost"
                    type="number"
                    value={cost}
                    onChange={handleCostChange}
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                    }}
                />
                {user?.permission === 'Admin' && carTotal > 0 && (
                    <Box sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'primary.light' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1,
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 0.9 }
                            }}
                            onClick={() => setShowBreakdown(!showBreakdown)}
                        >
                            <Typography variant="body2" fontWeight={600}>Total Car Cost Included:</Typography>
                            <Typography variant="body2" fontWeight={600}>₹{carTotal.toLocaleString()}</Typography>
                        </Box>
                        <Collapse in={showBreakdown}>
                            <Box sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                    Breakdown ({totalDays} Days - {season === 'off_season_price' ? 'Off Season' : 'Season'})
                                </Typography>
                                {carDetails.filter(car => car.car_count > 0).map((carDetail, index) => {
                                    const carConfig = configData?.additionalCosts?.car?.find(c => c.type === carDetail.car_name);
                                    const unitPrice = carConfig?.cost?.[season] || 0;
                                    const total = unitPrice * carDetail.car_count * totalDays;
                                    return (
                                        <Box key={index} sx={{ mb: 0.5 }}>
                                            <Grid container spacing={1}>
                                                <Grid item xs={7}>
                                                    <Typography variant="caption" sx={{ display: 'block' }}>
                                                        {carDetail.car_name} (x{carDetail.car_count})
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={5} textAlign="right">
                                                    <Typography variant="caption">₹{total.toLocaleString()}</Typography>
                                                </Grid>
                                            </Grid>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                ₹{unitPrice.toLocaleString()} × {carDetail.car_count} × {totalDays}
                                            </Typography>
                                            {index < carDetails.filter(car => car.car_count > 0).length - 1 && <Divider sx={{ my: 0.5, opacity: 0.5 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Collapse>
                    </Box>
                )}
                {user?.permission === 'Admin' && hotelTotal > 0 && (
                    <Box sx={{ mt: 1, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'info.light' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1,
                                bgcolor: 'info.light',
                                color: 'primary.contrastText',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 0.9 }
                            }}
                            onClick={() => setShowHotelBreakdown(!showHotelBreakdown)}
                        >
                            <Typography variant="body2" fontWeight={600}>Total Hotel Cost Included:</Typography>
                            <Typography variant="body2" fontWeight={600}>₹{hotelTotal.toLocaleString()}</Typography>
                        </Box>
                        <Collapse in={showHotelBreakdown}>
                            <Box sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                    Hotel Selection ({season === 'off_season_price' ? 'Off Season' : 'Season'})
                                </Typography>
                                {Object.keys(hotelSelections).map((dayIndex, index) => {
                                    const selection = hotelSelections[dayIndex];
                                    if (!selection?.hotelId) return null;
                                    const hotel = allHotels.find(h => h._id === selection.hotelId);
                                    const roomCat = selection.roomType;
                                    const plan = selection.mealPlan?.split('_')[0].toUpperCase();

                                    const breakdown = calculateSingleHotelCostWithBreakdown(selection, allHotels, season, tripDetails, stayInfo);

                                    return (
                                        <Box key={dayIndex} sx={{ mb: 1.5 }}>
                                            <Grid container spacing={1}>
                                                <Grid item xs={7}>
                                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                                        Day {parseInt(dayIndex) + 1}: {hotel?.hotel_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                                        {roomCat} | {plan}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={5} textAlign="right">
                                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                        ₹{breakdown.total.toLocaleString()}
                                                    </Typography>
                                                </Grid>
                                            </Grid>

                                            {/* Breakdown Details */}
                                            <Box sx={{ mt: 0.5, pl: 1 }}>
                                                {breakdown.baseCost > 0 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                                                        • Base: ₹{breakdown.details.basePrice.toLocaleString()} × {breakdown.details.rooms} Rooms = ₹{breakdown.baseCost.toLocaleString()}
                                                    </Typography>
                                                )}
                                                {breakdown.extraAdultCost > 0 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                                                        • Extra Mattress: ₹{breakdown.details.extraPrice.toLocaleString()} × {breakdown.details.extraAdults} Pax = ₹{breakdown.extraAdultCost.toLocaleString()}
                                                    </Typography>
                                                )}
                                                {breakdown.childCost > 0 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                                                        • CNB: ₹{breakdown.details.childPrice.toLocaleString()} × {breakdown.details.kids} Kids = ₹{breakdown.childCost.toLocaleString()}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {index < Object.keys(hotelSelections).length - 1 && <Divider sx={{ mt: 1, opacity: 0.5 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Collapse>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default CostEstimateCard;
