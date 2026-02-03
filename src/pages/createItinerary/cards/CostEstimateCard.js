import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';

const CostEstimateCard = ({ cost, handleCostChange }) => {
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Cost Estimate
            </Typography>
            <TextField
                fullWidth
                label="Total Cost"
                type="number"
                value={cost}
                onChange={handleCostChange}
                InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                }}
            />
        </Paper>
    );
};

export default CostEstimateCard;
