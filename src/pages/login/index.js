import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, TextField, Button, Typography, Paper } from '@mui/material';
import { addLoginToken } from '../../reduxcomponents/slices/tokenSlice';
import { loginUser } from '../../api/userAPI';
import {  setConfigData } from '../../reduxcomponents/slices/configSlice';
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
        <Container
            component="main"
            maxWidth="xs"
            style={{
                position: 'absolute',
                top: '50%',
                right: '10%',
                transform: 'translateY(-50%)'
            }}
        >
            <Paper
                elevation={3}
                style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Typography variant="h5" align="center">Login</Typography>
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
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '16px' }}
                    >
                        Login
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;
