import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Notification from "./notification";
import ProfileDropdown from "./ProfileDropDown";

const Top = ({ toggleDrawer }) => {

    const [anchorEl, setAnchorEl] = useState(null);

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleProfileClose = () => {
        setAnchorEl(null);
    }



    return (
        <>
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
                    <IconButton aria-label="fingerprint" color="secondary"
                        sx={{
                            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px"
                        }}>
                        <Notification />
                        <AccountCircleIcon
                            onClick={handleProfileClick}
                            sx={{ fontSize: 32, cursor: "pointer" }} />
                    </IconButton>
                </Toolbar>

            </AppBar>

            <ProfileDropdown
            anchorEl={anchorEl}
            handleClose={handleProfileClose}/>
        </>
    );
}

export default Top;