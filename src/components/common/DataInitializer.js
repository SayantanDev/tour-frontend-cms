import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import { fetchAllHotels } from '../../reduxcomponents/slices/hotelsSlice';
import { fetchAllPackages } from '../../reduxcomponents/slices/packagesSlice';
import { fetchConfig } from '../../reduxcomponents/slices/configSlice';
import { fetchAllPlaces } from '../../reduxcomponents/slices/placesSlice';

/**
 * DataInitializer component
 * Loads all essential data on app startup and stores in Redux
 * Shows loading state until data is ready
 */
const DataInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);

    // Check if user is logged in
    const isLoggedIn = useSelector((state) => state.loggedinUser?.isLoggedIn || false);

    // Get last fetched timestamps from Redux
    const hotelsLastFetched = useSelector((state) => state.hotels?.lastFetched);
    const packagesLastFetched = useSelector((state) => state.package?.lastFetched);
    const configLastFetched = useSelector((state) => state.config?.lastFetched);
    const placesLastFetched = useSelector((state) => state.place?.lastFetched);

    // Cache duration (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;

    const isCacheStale = (lastFetched) => {
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_DURATION;
    };

    useEffect(() => {
        const initializeData = async () => {
            // Only fetch if user is logged in
            if (!isLoggedIn) {
                setIsInitialized(true);
                return;
            }

            try {
                const promises = [];

                // Only fetch if cache is stale
                if (isCacheStale(hotelsLastFetched)) {
                    promises.push(dispatch(fetchAllHotels()));
                }
                if (isCacheStale(packagesLastFetched)) {
                    promises.push(dispatch(fetchAllPackages()));
                }
                if (isCacheStale(configLastFetched)) {
                    promises.push(dispatch(fetchConfig()));
                }
                if (isCacheStale(placesLastFetched)) {
                    promises.push(dispatch(fetchAllPlaces()));
                }

                if (promises.length > 0) {
                    await Promise.all(promises);
                }

                setIsInitialized(true);
            } catch (err) {
                console.error('Failed to initialize app data:', err);
                setError(err.message);
                // Still allow app to render even on error
                setIsInitialized(true);
            }
        };

        initializeData();
    }, [dispatch, isLoggedIn, hotelsLastFetched, packagesLastFetched, configLastFetched, placesLastFetched]);

    // Show loading backdrop while initializing
    if (!isInitialized) {
        return (
            <Backdrop open={true} sx={{ zIndex: 9999, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading application data...
                    </Typography>
                </Box>
            </Backdrop>
        );
    }

    // Show error message if initialization failed (optional - can be removed)
    if (error) {
        console.warn('Data initialization warning:', error);
    }

    return children;
};

export default DataInitializer;
