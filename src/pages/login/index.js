import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Typography, Paper, Box, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { addLoginToken } from '../../reduxcomponents/slices/tokenSlice';
import { loginUser } from '../../api/userAPI';
import { setConfigData } from '../../reduxcomponents/slices/configSlice';
import { configString } from '../../api/configApi';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Initialize from local storage if remember me was previously checked
    React.useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        const rememberedPassword = localStorage.getItem("rememberedPassword");
        if (rememberedEmail && rememberedPassword) {
            setLoginData({
                email: rememberedEmail,
                password: rememberedPassword
            });
            setRememberMe(true);
        }
    }, []);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Handle Remember Me logic
        if (rememberMe) {
            localStorage.setItem("rememberedEmail", loginData.email);
            localStorage.setItem("rememberedPassword", loginData.password);
        } else {
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("rememberedPassword");
        }

        try {
            const res = await loginUser(loginData);
            // Save tokens in localStorage (for axios interceptor)
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);

            // Save user & tokens in redux
            dispatch(addLoginToken({
                token: res.data.accessToken,
                refreshToken: res.data.refreshToken,
                user: res.data.user,
                permission: res.data.permission,
            }));
            // ✅ Dispatch config string fetch here
            const configRes = await configString();
            console.log("configRes", configRes.data);

            dispatch(setConfigData(configRes.data));
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed:", err.response?.data?.message || err.message);
            alert("Login failed! Please check your credentials.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                // Using transparent to let any global background image show through.
                // If you want a specific background color, change this.
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 550, // Made wider as requested
                    px: 3,
                }}
            >
                <Box mb={4} textAlign="center">
                    <img
                        src="/easo.png"
                        alt="EasoTrip Logo"
                        style={{
                            maxWidth: '220px', // Slightly larger logo for wider form
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            margin: '0 auto',
                        }}
                    />
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        p: { xs: 3, sm: 5 }, // Increased padding
                        borderRadius: 3,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #edf2f7',
                    }}
                >
                    <Typography
                        variant="h5"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: '#1a202c',
                            mb: 1,
                        }}
                    >
                        Welcome Back
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mb: 4, color: '#718096' }}
                    >
                        Please enter your details to sign in
                    </Typography>

                    <form onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            value={loginData.email}
                            name="email"
                            onChange={handleChange}
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            variant="outlined"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f8fafc',
                                    '& fieldset': {
                                        borderColor: '#e2e8f0',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#cbd5e0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            value={loginData.password}
                            name="password"
                            onChange={handleChange}
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f8fafc',
                                    '& fieldset': {
                                        borderColor: '#e2e8f0',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#cbd5e0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        value="remember"
                                        color="primary"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                }
                                label="Remember me"
                            />
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 2,
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                            }}
                        >
                            Sign In
                        </Button>
                    </form>
                </Paper>

                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        mt: 4,
                        color: 'rgba(255, 255, 255, 0.9)', // Kept light for potential dark background
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)', // Added shadow for readability
                    }}
                >
                    © 2026 EasoTrip. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );

};

export default Login;
