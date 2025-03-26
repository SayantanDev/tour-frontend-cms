import React from "react";
import { FormControl, Button, TextField, InputLabel, Select, MenuItem, Grid } from '@mui/material';

const LeftColumn = ({
    handleSandakphuChange, 
    sandakphuFormData, 
    handleSandakphuFileChange, 
    handleSandakphuSubmit, 
    handleClose
}) => {
    
    return (
        <Grid item xs={4}>
            <FormControl fullWidth variant="outlined" size="small" margin="normal">
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                    labelId="type-label"
                    name="type"
                    value={sandakphuFormData.type}
                    onChange={handleSandakphuChange}
                    label="Type"
                >
                    <MenuItem value="Trek">Trek</MenuItem>
                    <MenuItem value="LandRover">Land Rover</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="URL"
                name="url"
                value={sandakphuFormData.url}
                onChange={handleSandakphuChange}
                fullWidth
                size="small"
                margin="normal"
            />
            <TextField
                label="Label"
                name="label"
                value={sandakphuFormData.label}
                onChange={handleSandakphuChange}
                fullWidth
                size="small"
                margin="normal"
            />
            <TextField
                type="file"
                onChange={handleSandakphuFileChange}
                inputProps={{ accept: '.jpg,.jpeg,.png' }}
                fullWidth
                size="small"
                margin="normal"
            />
            <Grid item xs={12} display="flex" flexDirection="row" spacing={2} sx={{ marginTop: '20px' }}>
                <Button
                    variant="outlined"
                    color="success"
                    xs={6}
                    fullWidth
                    size="small"
                    onClick={handleSandakphuSubmit}
                    sx={{ marginBottom: 1 }} 
                >
                    Submit
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    xs={6}
                    fullWidth
                    size="small"
                    onClick={handleClose}
                    sx={{ marginBottom: 1 }} 
                >
                    Cancel
                </Button>
            </Grid>
        </Grid>
    );
}
  
export default LeftColumn;