import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

const SelectedPackageCard = ({ selectedPackage }) => {
    if (!selectedPackage) return null;

    return (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Selected Package
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Chip label={selectedPackage.label} color="primary" sx={{ mr: 1 }} />
                <Chip label={selectedPackage.location} />
            </Box>
        </Paper>
    );
};

export default SelectedPackageCard;
