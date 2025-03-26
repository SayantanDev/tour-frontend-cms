import React from "react";
import {
    Grid,
    Typography,
    TextField
} from '@mui/material';

const Reach = ({reachData, reachUpdate}) => {

    const reachChange = (e) => {
        const newReach = {
            para: e.target.value
        };
        reachUpdate(newReach);
    }
    
    return (
        <Grid container spacing={2} sx={{ marginTop: 2 }} >
            <Typography variant="h5">How To Reach</Typography>
            <TextField
                label="Content"
                name="howToReach"
                value={reachData.para}
                onChange={reachChange}
                fullWidth
                size="small"
                margin="normal"
                multiline
                rows={8} 
            />
        </Grid>
    );
}
  
export default Reach;