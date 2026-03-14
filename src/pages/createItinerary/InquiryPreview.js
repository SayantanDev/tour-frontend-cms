import React from 'react';
import {
    Box, Typography, Paper, Grid, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Button, TextField
} from '@mui/material';

const InquiryPreview = ({
    guestInfo,
    tripDetails,
    stayInfo,
    itinerary,
    hotelSelections,
    allHotels,
    selectedPackage,
    cost,
    detailedItinerary,
    onDetailedItineraryChange
}) => {
    const [isEditingItinerary, setIsEditingItinerary] = React.useState(false);
    const [tempDetailedItinerary, setTempDetailedItinerary] = React.useState(detailedItinerary || '');

    // Synchronize temp state when prop changes (from external edits)
    React.useEffect(() => {
        setTempDetailedItinerary(detailedItinerary || '');
    }, [detailedItinerary]);

    // Colors from PDF export
    const DARK_GREEN = '#1b5e20';
    const DARK = '#1f2937';
    const MID = '#6b7280';
    const LIGHT_BG = '#f5f7fa';

    const SectionTitle = ({ title, onEdit, isEditing }) => (
        <Box sx={{ backgroundColor: DARK_GREEN, py: 0.8, px: 1.5, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {title}
            </Typography>
            {onEdit && (
                <Stack direction="row" spacing={1}>
                    {isEditing ? (
                        <>
                            <Button
                                size="small"
                                color="success"
                                variant="contained"
                                onClick={() => {
                                    onDetailedItineraryChange(tempDetailedItinerary);
                                    setIsEditingItinerary(false);
                                }}
                                sx={{ py: 0, px: 1, minWidth: 0, height: '22px', fontSize: '10px' }}
                            >
                                Save
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                variant="contained"
                                onClick={() => {
                                    setTempDetailedItinerary(detailedItinerary || '');
                                    setIsEditingItinerary(false);
                                }}
                                sx={{ py: 0, px: 1, minWidth: 0, height: '22px', fontSize: '10px' }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => setIsEditingItinerary(true)}
                            sx={{ py: 0, px: 1, minWidth: 0, height: '22px', fontSize: '10px' }}
                        >
                            Edit
                        </Button>
                    )}
                </Stack>
            )}
        </Box>
    );

    const InfoRow = ({ label, value }) => (
        <Box sx={{ display: 'flex', mb: 0.8 }}>
            <Typography sx={{ color: MID, width: '150px', fontSize: '0.85rem' }}>{label}</Typography>
            <Typography sx={{ color: DARK, fontWeight: 700, fontSize: '0.9rem' }}>{value || '—'}</Typography>
        </Box>
    );

    const TwoColRow = ({ lblL, valL, lblR, valR }) => (
        <Grid container spacing={2} sx={{ mb: 0.8 }}>
            <Grid item xs={6}>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ color: MID, width: '120px', fontSize: '0.85rem' }}>{lblL}</Typography>
                    <Typography sx={{ color: DARK, fontWeight: 700, fontSize: '0.875rem' }}>{valL || '—'}</Typography>
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ color: MID, width: '120px', fontSize: '0.85rem' }}>{lblR}</Typography>
                    <Typography sx={{ color: DARK, fontWeight: 700, fontSize: '0.875rem' }}>{valR || '—'}</Typography>
                </Box>
            </Grid>
        </Grid>
    );

    const activeCars = (tripDetails.car_details || []).filter(c => c.car_count > 0);
    const vehicleStr = activeCars.length
        ? activeCars.map(c => `${c.car_name} (${c.car_count})`).join(', ')
        : '—';

    return (
        <Box sx={{ p: 0, backgroundColor: '#fff', maxWidth: '800px', margin: '0 auto', border: '1px solid #eee' }}>
            {/* PDF Header Simulation */}
            <Box sx={{ position: 'relative', height: '100px', overflow: 'hidden', borderBottom: '1px solid #ddd' }}>
                <Box sx={{
                    position: 'absolute',
                    top: '-40px',
                    left: '-40px',
                    width: '120px',
                    height: '120px',
                    backgroundColor: DARK_GREEN,
                    borderRadius: '50%'
                }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: DARK_GREEN, letterSpacing: '1px' }}>EASOTRIP</Typography>
                        <Typography variant="caption" sx={{ color: MID }}>Premium Travel Experiences</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 4 }}>
                {/* Guest Information */}
                <SectionTitle title="Guest Information" />
                <Box sx={{ px: 1, mb: 3 }}>
                    <InfoRow label="Name" value={guestInfo.guest_name} />
                    <InfoRow label="Phone" value={`${guestInfo.country_code || '+91'} ${guestInfo.guest_phone}`} />
                    <InfoRow label="Email" value={guestInfo.guest_email} />
                </Box>

                {/* Trip Details */}
                <SectionTitle title="Trip Details" />
                <Box sx={{ px: 1, mb: 3 }}>
                    <TwoColRow
                        lblL="Travel Date"
                        valL={tripDetails.travel_date ? new Date(tripDetails.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        lblR="Adults (Pax)"
                        valR={tripDetails.pax}
                    />
                    <TwoColRow
                        lblL="Duration"
                        valL={tripDetails.duration ? `${tripDetails.duration} Nights / ${Number(tripDetails.duration) + 1} Days` : '—'}
                        lblR="Kids (5+)"
                        valR={tripDetails.kids_above_5 || 0}
                    />
                    <TwoColRow
                        lblL="Pickup"
                        valL={tripDetails.pickup_location}
                        lblR="Rooms"
                        valR={stayInfo.rooms}
                    />
                    <TwoColRow
                        lblL="Dropoff"
                        valL={tripDetails.dropoff_location}
                        lblR="Vehicles"
                        valR={vehicleStr}
                    />
                </Box>

                {/* Short Itinerary */}
                {itinerary && itinerary.length > 0 && (
                    <>
                        <SectionTitle title="Short Itinerary" />
                        <Box sx={{ mb: 3 }}>
                            {itinerary.map((item, idx) => {
                                const itemText = typeof item === 'string' ? item : (item?.tagValue || item?.tagName || '');
                                return (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: 'flex',
                                            p: 1.2,
                                            backgroundColor: idx % 2 === 0 ? LIGHT_BG : 'transparent',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: 700, color: DARK_GREEN, width: '70px', fontSize: '0.85rem' }}>
                                            Day {idx + 1}:
                                        </Typography>
                                        <Typography sx={{ color: DARK, fontSize: '0.85rem', flex: 1 }}>
                                            {itemText}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}

                {/* Detailed Itinerary (if any or if editing) */}
                <SectionTitle
                    title="Detailed Itinerary"
                    onEdit={onDetailedItineraryChange}
                    isEditing={isEditingItinerary}
                />
                <Box sx={{ px: 1, mb: 3 }}>
                    {isEditingItinerary ? (
                        <TextField
                            fullWidth
                            multiline
                            minRows={6}
                            maxRows={15}
                            value={tempDetailedItinerary}
                            onChange={(e) => setTempDetailedItinerary(e.target.value)}
                            size="small"
                            placeholder="Type or paste the detailed itinerary here..."
                            sx={{ bgcolor: '#fff', fontSize: '0.85rem' }}
                        />
                    ) : (
                        <Typography sx={{ fontSize: '0.85rem', color: DARK, whiteSpace: 'pre-wrap' }}>
                            {detailedItinerary || 'No detailed itinerary provided yet.'}
                        </Typography>
                    )}
                </Box>

                {/* Optional Extras */}
                {tripDetails.optional_extras && tripDetails.optional_extras.length > 0 && (
                    <>
                        <SectionTitle title="Optional Extras" />
                        <Box sx={{ px: 1, mb: 3 }}>
                            {tripDetails.optional_extras.map((extra, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ color: DARK, fontSize: '0.85rem' }}>{extra.name}</Typography>
                                    <Typography sx={{ color: DARK, fontWeight: 700, fontSize: '0.9rem' }}>₹{extra.price?.toLocaleString()}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </>
                )}

                {/* Hotel Selections */}
                {Object.keys(hotelSelections).filter(d => hotelSelections[d]?.hotelId).length > 0 && (
                    <>
                        <SectionTitle title="Hotel Selections" />
                        <TableContainer sx={{ mb: 3, border: '1px solid #eee' }}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Night</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Hotel</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Room Type</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Meal Plan</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(hotelSelections).filter(([_, sel]) => sel.hotelId).map(([dayIdx, sel], i) => {
                                        const hotel = allHotels.find(h => h._id === sel.hotelId);
                                        const mealPlanLabel = {
                                            cp_plan: 'Breakfast',
                                            map_plan: 'Breakfast + 1 major meal',
                                            ap_plan: 'All meals',
                                        }[sel.mealPlan] || sel.mealPlan || '—';

                                        return (
                                            <TableRow key={dayIdx} sx={{ backgroundColor: i % 2 === 0 ? LIGHT_BG : 'transparent' }}>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>Night {Number(dayIdx) + 1}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{hotel?.hotel_name || '—'}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{sel.roomType || '—'}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{mealPlanLabel}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {/* Total Cost Bar */}
                <Box sx={{
                    backgroundColor: DARK_GREEN,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>TOTAL QUOTED PRICE</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>INR {cost.toLocaleString('en-IN')}</Typography>
                </Box>

                {/* Terms & Footer */}
                <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
                    <Typography variant="caption" sx={{ color: MID, fontWeight: 700, display: 'block', mb: 1 }}>Terms & Conditions</Typography>
                    <Typography variant="caption" sx={{ color: MID, display: 'block' }}>• This is a preliminary quotation and is subject to change based on availability.</Typography>
                    <Typography variant="caption" sx={{ color: MID, display: 'block' }}>• Rates are valid for the indicated travel dates only.</Typography>
                    <Typography variant="caption" sx={{ color: MID, display: 'block' }}>• 50% advance required to confirm bookings.</Typography>
                    <Typography variant="caption" sx={{ color: MID, display: 'block' }}>• Cancellation charges apply as per policy.</Typography>
                </Box>
            </Box>

            {/* Footer Bar */}
            <Box sx={{ backgroundColor: DARK_GREEN, p: 1.5, display: 'flex', justifyContent: 'center', gap: 4 }}>
                <Typography variant="caption" sx={{ color: '#fff' }}>www.easotrip.com</Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>+91 70017 24300</Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>easogroup@gmail.com</Typography>
            </Box>
        </Box>
    );
};

export default InquiryPreview;
