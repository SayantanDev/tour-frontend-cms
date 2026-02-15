import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';

const PdfPreview = ({ guestInfo, tripDetails, selectedPackage, hotelSelections, allHotels, cost, itinerary }) => {
    const getHotelName = (hotelId) => {
        const hotel = allHotels.find(h => h._id === hotelId);
        return hotel ? hotel.name : 'Not selected';
    };

    // Use passed itinerary if available, otherwise fallback to package short itinerary
    const displayItinerary = (itinerary && itinerary.length > 0)
        ? itinerary
        : selectedPackage?.details?.shortItinerary;

    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                overflow: 'auto',
                backgroundColor: '#fff',
                p: 4,
                pb: 0,
            }}
        >
            {/* Header */}
            {/* <Box sx={{ textAlign: 'center', mb: 4 }}>
                <img
                    src="/easo.png"
                    alt="EAS☀TRIP"
                    style={{ maxWidth: '150px', marginBottom: '16px' }}
                />
            </Box> */}

            {/* Package Cost */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#89e3bfff' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                    Package cost:
                </Typography>
                <Typography variant="body2">
                    <strong>Cost:</strong> ₹{cost.toLocaleString()}/-
                </Typography>
            </Paper>

            {/* Guest Details */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                    Guest Details:
                </Typography>
                <Typography variant="body2">
                    <strong>Name:</strong> {guestInfo.guest_name || 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>Email:</strong> {guestInfo.guest_email || 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>Contact No:</strong> {guestInfo.guest_phone || 'N/A'}
                </Typography>
            </Paper>

            {/* Trip Details */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                    Trip Details:
                </Typography>
                <Typography variant="body2">
                    <strong>Location:</strong> {tripDetails.location || selectedPackage?.location || 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>Starting Point:</strong> {selectedPackage?.details?.startingPoint || 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>End point:</strong> {selectedPackage?.details?.endPoint || 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>Travel Date:</strong> {tripDetails.travel_date || 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>Number of Pax:</strong> {tripDetails.pax || 'N/A'} (
                    {tripDetails.pax && tripDetails.pax > 12 ? `${Math.floor(tripDetails.pax / 2)} adults` : `${tripDetails.pax} adults`})
                </Typography>
                <Typography variant="body2">
                    <strong>Duration:</strong> {tripDetails.duration || selectedPackage?.duration || 'N/A'} Days
                </Typography>
                {tripDetails.car_details && tripDetails.car_details.length > 0 && (
                    <Typography variant="body2">
                        <strong>Vehicles:</strong> {tripDetails.car_details.map(car => `${car.car_name} (x${car.car_count})`).join(', ')}
                    </Typography>
                )}
            </Paper>

            {/* Short Itinerary */}
            {displayItinerary && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                        Short Itinerary:
                    </Typography>
                    {displayItinerary.map((day, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Day {index + 1}:</strong> {typeof day === 'string' ? day : day?.tagValue || day?.tagName || 'N/A'}
                        </Typography>
                    ))}
                </Paper>
            )}

            {/* Optional Extras */}
            {selectedPackage?.details?.cost?.optionalExtras && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                        Optionals Extra: (Per Car)
                    </Typography>
                    {selectedPackage.details.cost.optionalExtras.map((extra, index) => (
                        <Typography key={index} variant="body2">
                            {typeof extra === 'object' ? (extra.name || extra.tagValue || extra.tagName) : extra}: ₹{typeof extra === 'object' ? (extra.price || 0) : 0}/-
                        </Typography>
                    ))}
                </Paper>
            )}

            {/* Meal Plan */}
            {/* <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                    Meal Plan:
                </Typography>
                <Typography variant="body2">
                    {selectedPackage?.details?.mealPlan || 'Breakfast only'}
                </Typography>
            </Paper> */}

            {/* Includes */}
            {selectedPackage?.details?.cost?.inclusions && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                        Includes:
                    </Typography>
                    {selectedPackage.details.cost.inclusions.map((item, index) => (
                        <Typography key={index} variant="body2">
                            • {typeof item === 'string' ? item : item.tagValue || item.tagName || JSON.stringify(item)}
                        </Typography>
                    ))}
                </Paper>
            )}

            {/* Excludes */}
            {selectedPackage?.details?.cost?.exclusions && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                        Excludes:
                    </Typography>
                    {selectedPackage.details.cost.exclusions.map((item, index) => (
                        <Typography key={index} variant="body2">
                            • {typeof item === 'string' ? item : item.tagValue || item.tagName || JSON.stringify(item)}
                        </Typography>
                    ))}
                </Paper>
            )}

            {/* Hotels */}
            {Object.keys(hotelSelections).length > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                        Hotels:
                    </Typography>
                    {Object.entries(hotelSelections).map(([day, selection]) => {
                        const hotelId = typeof selection === 'string' ? selection : selection?.hotelId;
                        const location = typeof selection === 'object' ? selection?.location : '';
                        const price = typeof selection === 'object' ? selection?.price : 0;

                        return hotelId ? (
                            <Typography key={day} variant="body2">
                                <strong>Day {parseInt(day) + 1}:</strong> {getHotelName(hotelId)}
                                {location && ` (${location})`}
                                {price > 0 && ` - ₹${price}/-`}
                            </Typography>
                        ) : null;
                    })}
                </Paper>
            )}

            {/* Detailed Itinerary */}
            {selectedPackage?.details?.detailedItinerary && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2d5016' }}>
                        Detailed Itinerary:
                    </Typography>
                    {selectedPackage.details.detailedItinerary.map((dayDetail, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Day {index + 1}: {dayDetail.title}
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {dayDetail.description}
                            </Typography>
                            {dayDetail.activities && dayDetail.activities.length > 0 && (
                                <Box sx={{ ml: 2, mt: 1 }}>
                                    {dayDetail.activities.map((activity, actIdx) => (
                                        <Typography key={actIdx} variant="body2">
                                            • {typeof activity === 'string' ? activity : activity?.tagValue || activity?.tagName || 'N/A'}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Paper>
            )}

            {/* Footer */}
            {/* <Divider sx={{ my: 3 }} />
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    www.easotrip.com | +91 70017 24300 | easotrip@gmail.com
                </Typography>
            </Box> */}
        </Box>
    );
};

export default PdfPreview;
