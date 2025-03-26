import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxcomponents/slices/rootReducer';

const withAuthRedirect = (WrappedComponent) => {
    return (props) => {
        const navigate = useNavigate();
        const location = useLocation();
        const token = useSelector((state) => state.tokens.tokens.token);
        useEffect(() => {
            if (token && location.pathname !== '/logout') {
                navigate('/dashboard');
            }
        }, [token, location.pathname, navigate]);

        return (!token || location.pathname === '/logout') ? <WrappedComponent {...props} /> : null;
    };
};

export default withAuthRedirect;