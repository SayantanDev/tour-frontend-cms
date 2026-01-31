import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box
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
            <AppBar
                position="fixed"
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    boxShadow: '0px 4px 20px rgba(25, 118, 210, 0.3)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{
                            mr: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'rotate(90deg)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                        onClick={toggleDrawer}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        Tour Operation CMS
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Notification />
                        <IconButton
                            color="inherit"
                            onClick={handleProfileClick}
                            sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            <AccountCircleIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <ProfileDropdown
                anchorEl={anchorEl}
                handleClose={handleProfileClose}
            />
        </>
    );
}

export default Top;