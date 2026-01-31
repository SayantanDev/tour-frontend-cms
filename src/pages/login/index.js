import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, TextField, Button, Typography, Paper, Box } from '@mui/material';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
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
            className="login-container fade-in"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    animation: 'shimmer 20s linear infinite',
                },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 450,
                    px: 3,
                }}
            >
                <Box mb={4} textAlign="center">
                    <img
                        src="/easo.png"
                        alt="EasoTrip Logo"
                        style={{
                            maxWidth: '200px',
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            margin: '0 auto',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                        }}
                    />
                </Box>

                <Paper
                    elevation={0}
                    className="glass-effect"
                    sx={{
                        width: '100%',
                        p: { xs: 3, sm: 4 },
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 3,
                        }}
                    >
                        Welcome Back
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mb: 3, color: 'text.secondary' }}
                    >
                        Sign in to access your tour management dashboard
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#e8e1e1',
                                    '&:hover': {
                                        backgroundColor: '#e8e1e1',
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
                            type="password"
                            autoComplete="current-password"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#e8e1e1',
                                    '&:hover': {
                                        backgroundColor: '#e8e1e1',
                                    },
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                    boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                                    transform: 'translateY(-2px)',
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
                        mt: 3,
                        color: 'rgba(255, 255, 255, 0.9)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    © 2026 EasoTrip. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );

};

export default Login;
