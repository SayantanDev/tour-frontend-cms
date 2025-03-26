import React from "react";
import { TextField, Typography, Grid } from '@mui/material';

const Header = ({headerData, headerUpdate}) => {
    const headerChange = (e) => {
        const { name, value} = e.target;
        let newHeader = {};
        switch(name) {
            case 'headerh1':
                newHeader = {
                    ...headerData,
                    h1: value
                };
                headerUpdate(newHeader);
                break;
            case 'headerh2':
                newHeader = {
                    ...headerData,
                    h2: value
                };
                headerUpdate(newHeader);
                break;
            case 'headerh3':
                newHeader = {
                    ...headerData,
                    h3: value
                };
                headerUpdate(newHeader);
                break;
            default:
                headerUpdate(headerData);
                break;
        }
    }

    return (
        <Grid container spacing={2} sx={{ marginTop: 2 }} >
            <Typography variant="h5">Header</Typography>
            <Grid item xs={12}>
                <TextField
                    label="Page Main Header"
                    name="headerh1"
                    value={headerData.h1}
                    onChange={headerChange}
                    fullWidth
                    size="small"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Page Second Header"
                    name="headerh2"
                    value={headerData.h2}
                    onChange={headerChange}
                    fullWidth
                    size="small"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Page Last Header"
                    name="headerh3"
                    value={headerData.h3}
                    onChange={headerChange}
                    fullWidth
                    size="small"
                    margin="normal"
                />
            </Grid>
        </Grid>
    );
}
  
export default Header;