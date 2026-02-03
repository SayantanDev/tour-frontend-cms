import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllHotels, selectAllHotels, selectHotelsLoading, selectHotelsLastFetched } from '../reduxcomponents/slices/hotelsSlice';
import { fetchAllPackages, selectAllPackages, selectPackagesLoading, selectPackagesLastFetched } from '../reduxcomponents/slices/packagesSlice';
import { fetchConfig, selectConfigData, selectConfigLoading, selectConfigLastFetched } from '../reduxcomponents/slices/configSlice';
import { fetchAllPlaces, selectAllPlaces, selectPlacesLoading, selectPlacesLastFetched } from '../reduxcomponents/slices/placesSlice';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Custom hook for centralized data management with Redux
 * Provides access to all app data and handles fetching with caching
 */
const useAppData = (options = {}) => {
    const dispatch = useDispatch();
    const {
        autoFetch = true,
        forceRefresh = false,
        cacheDuration = CACHE_DURATION
    } = options;

    // Selectors for all data
    const allHotels = useSelector(selectAllHotels);
    const hotelsLoading = useSelector(selectHotelsLoading);
    const hotelsLastFetched = useSelector(selectHotelsLastFetched);

    const allPackages = useSelector(selectAllPackages);
    const packagesLoading = useSelector(selectPackagesLoading);
    const packagesLastFetched = useSelector(selectPackagesLastFetched);

    const configData = useSelector(selectConfigData);
    const configLoading = useSelector(selectConfigLoading);
    const configLastFetched = useSelector(selectConfigLastFetched);

    const allPlaces = useSelector(selectAllPlaces);
    const placesLoading = useSelector(selectPlacesLoading);
    const placesLastFetched = useSelector(selectPlacesLastFetched);

    // Check if cache is stale
    const isCacheStale = useCallback((lastFetched) => {
        if (!lastFetched) return true;
        return Date.now() - lastFetched > cacheDuration;
    }, [cacheDuration]);

    // Fetch individual data types
    const fetchHotels = useCallback(async (force = false) => {
        if (force || isCacheStale(hotelsLastFetched)) {
            await dispatch(fetchAllHotels());
        }
    }, [dispatch, hotelsLastFetched, isCacheStale]);

    const fetchPackages = useCallback(async (force = false) => {
        if (force || isCacheStale(packagesLastFetched)) {
            await dispatch(fetchAllPackages());
        }
    }, [dispatch, packagesLastFetched, isCacheStale]);

    const fetchConfigData = useCallback(async (force = false) => {
        if (force || isCacheStale(configLastFetched)) {
            await dispatch(fetchConfig());
        }
    }, [dispatch, configLastFetched, isCacheStale]);

    const fetchPlaces = useCallback(async (force = false) => {
        if (force || isCacheStale(placesLastFetched)) {
            await dispatch(fetchAllPlaces());
        }
    }, [dispatch, placesLastFetched, isCacheStale]);

    // Fetch all data at once
    const fetchAllData = useCallback(async (force = false) => {
        const promises = [];

        if (force || isCacheStale(hotelsLastFetched)) {
            promises.push(dispatch(fetchAllHotels()));
        }
        if (force || isCacheStale(packagesLastFetched)) {
            promises.push(dispatch(fetchAllPackages()));
        }
        if (force || isCacheStale(configLastFetched)) {
            promises.push(dispatch(fetchConfig()));
        }
        if (force || isCacheStale(placesLastFetched)) {
            promises.push(dispatch(fetchAllPlaces()));
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }, [dispatch, hotelsLastFetched, packagesLastFetched, configLastFetched, placesLastFetched, isCacheStale]);

    // Refresh all data (force fetch)
    const refreshAllData = useCallback(() => {
        return fetchAllData(true);
    }, [fetchAllData]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchAllData(forceRefresh);
        }
    }, [autoFetch, forceRefresh, fetchAllData]);

    // Compute derived data
    const uniqueLocations = [...new Set(allPackages.map(pkg => pkg.location))].filter(Boolean);

    // Loading states
    const isLoading = hotelsLoading || packagesLoading || configLoading || placesLoading;
    const isInitialLoading = isLoading && (!allHotels.length || !allPackages.length);

    return {
        // Data
        allHotels,
        allPackages,
        configData,
        allPlaces,
        uniqueLocations,

        // Loading states
        isLoading,
        isInitialLoading,
        hotelsLoading,
        packagesLoading,
        configLoading,
        placesLoading,

        // Fetch functions
        fetchHotels,
        fetchPackages,
        fetchConfigData,
        fetchPlaces,
        fetchAllData,
        refreshAllData,

        // Cache info
        hotelsLastFetched,
        packagesLastFetched,
        configLastFetched,
        placesLastFetched,
        isCacheStale,
    };
};

export default useAppData;
