import React from 'react';
import {
    Paper, Box, Typography, Button, Grid, TextField
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
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Guest Information
                </Typography>
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
                    <TextField
                        fullWidth
                        label="Guest Name"
                        name="guest_name"
                        value={guestInfo.guest_name}
                        onChange={handleGuestInfoChange}
                        required
                        error={!guestInfo.guest_name && snackbar.open}
                        inputRef={guestNameRef}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Guest Email"
                        name="guest_email"
                        type="email"
                        value={guestInfo.guest_email}
                        onChange={handleGuestInfoChange}
                        required
                        error={!guestInfo.guest_email && snackbar.open}
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
                                    height: '56px',
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
                                label="Phone Number"
                                name="guest_phone"
                                value={guestInfo.guest_phone}
                                onChange={handleGuestInfoChange}
                                required
                                error={!guestInfo.guest_phone && snackbar.open}
                                type="tel"
                            />
                        </Grid>
                    </Grid>
                    {!guestInfo.guest_phone && snackbar.open && (
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
                                label="Adults"
                                name="pax"
                                type="number"
                                value={tripDetails.pax}
                                onChange={(e) => setTripDetails({ ...tripDetails, pax: e.target.value })}
                                required
                                error={!tripDetails.pax && snackbar.open}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
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
        </Paper>
    );
};

export default GuestInfoCard;
