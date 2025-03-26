import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Top = ( {toggleDrawer} ) => {
    
    return (
        <AppBar position="fixed">
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 2 }}
                    onClick={toggleDrawer}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Tour Operation
                </Typography>
                <IconButton aria-label="fingerprint" color="secondary">
                    <AccountCircleIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
  
export default Top;