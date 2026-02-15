import React, { useState } from 'react';
import {
    Paper, Box, Typography, Button, Grid, TextField, Chip, Stack, Collapse
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

const GuestInfoCard = ({
    guestInfo,
    setGuestInfo,
    handleGuestInfoChange,
    tripDetails,
    setTripDetails,
    handleTripDetailsChange,
    snackbar,
    guestNameRef,
    onReset
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
                        Guest Information
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {guestInfo.guest_name && (
                            <Chip label={`Name: ${guestInfo.guest_name}`} size="small" color="success" variant="outlined" />
                        )}
                        {guestInfo.guest_email && (
                            <Chip label={`Email: ${guestInfo.guest_email}`} size="small" color="success" variant="outlined" />
                        )}
                        {guestInfo.guest_phone && (
                            <Chip label={`Phone: ${guestInfo.country_code || ''}${guestInfo.guest_phone}`} size="small" color="success" variant="outlined" />
                        )}
                        {tripDetails.pax > 0 && (
                            <Chip label={`Adults: ${tripDetails.pax}`} size="small" color="success" variant="outlined" />
                        )}
                        {tripDetails.kids_above_5 > 0 && (
                            <Chip label={`Kids (>5): ${tripDetails.kids_above_5}`} size="small" color="success" variant="outlined" />
                        )}
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

            <Collapse in={isExpanded}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Guest Name"
                            name="guest_name"
                            value={guestInfo.guest_name}
                            onChange={handleGuestInfoChange}
                            required
                            error={!guestInfo.guest_name && snackbar.open && snackbar.severity === 'error'}
                            inputRef={guestNameRef}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Guest Email"
                            name="guest_email"
                            type="email"
                            value={guestInfo.guest_email}
                            onChange={handleGuestInfoChange}
                            required
                            error={!guestInfo.guest_email && snackbar.open && snackbar.severity === 'error'}
                            helperText="Will be used for sending quotation"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <PhoneInput
                                    country={'in'}
                                    value={guestInfo.country_code}
                                    onChange={(phone, country) => {
                                        setGuestInfo({ ...guestInfo, country_code: `+${country.dialCode}` });
                                    }}
                                    inputStyle={{
                                        width: '100%',
                                        height: '40px',
                                        fontSize: '16px',
                                        paddingLeft: '48px',
                                        borderRadius: '4px',
                                        borderColor: 'rgba(0, 0, 0, 0.23)',
                                        backgroundColor: '#fff'
                                    }}
                                    containerStyle={{
                                        marginTop: '0px',
                                        marginBottom: '0px',
                                    }}
                                    dropdownStyle={{
                                        zIndex: 1000
                                    }}
                                    specialLabel="Code"
                                    disableDropdown={false}
                                    enableAreaCodes={true}
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Phone Number"
                                    name="guest_phone"
                                    value={guestInfo.guest_phone}
                                    onChange={handleGuestInfoChange}
                                    required
                                    error={!guestInfo.guest_phone && snackbar.open && snackbar.severity === 'error'}
                                    type="tel"
                                />
                            </Grid>
                        </Grid>
                        {!guestInfo.guest_phone && snackbar.open && snackbar.severity === 'error' && (
                            <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                Phone number is required
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Adults"
                                    name="pax"
                                    type="number"
                                    value={tripDetails.pax}
                                    onChange={(e) => setTripDetails({ ...tripDetails, pax: e.target.value })}
                                    required
                                    error={!tripDetails.pax && snackbar.open && snackbar.severity === 'error'}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Kid(s) (>5)"
                                    name="kids_above_5"
                                    type="number"
                                    value={tripDetails.kids_above_5}
                                    onChange={(e) => setTripDetails({ ...tripDetails, kids_above_5: e.target.value })}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Collapse>
        </Paper>
    );
};

export default GuestInfoCard;
