import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, TextField, Button, Typography, Paper } from '@mui/material';
import { addLoginToken } from '../../reduxcomponents/slices/tokenSlice';
import { loginUser } from '../../api/userAPI';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ loginData, setLoginData ] = useState({
        email: '', 
        password: '',
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
        console.log('login1', loginData)
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        loginUser(loginData)
            .then((res) => {
                const tokenObj = {
                    token: res.data.accessToken,
                    refreshToken: res.data.refreshToken,
                };
                
                dispatch(addLoginToken(tokenObj));
                navigate('/dashboard');
            })
            .catch((err) => {
            });

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
                    onChange={(e) => handleChange(e)}
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
                    onChange={(e) => handleChange(e)}
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