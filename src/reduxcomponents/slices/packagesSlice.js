import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllPackages, addPackage, updatePackage, deletePackage } from '../../api/packageAPI';

// Async thunks for API calls
export const fetchAllPackages = createAsyncThunk(
    'packages/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllPackages();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addPackageAsync = createAsyncThunk(
    'packages/add',
    async (packageData, { rejectWithValue }) => {
        try {
            const response = await addPackage(packageData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePackageAsync = createAsyncThunk(
    'packages/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updatePackage(data, id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePackageAsync = createAsyncThunk(
    'packages/delete',
    async (id, { rejectWithValue }) => {
        try {
            await deletePackage(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    allPackages: [],
    fetchSelectedPackage: {},
    fetchNewPackageInfo: {},
    fetchNewPackageItinerary: {},
    checkItinery: false,
    checkReach: false,
    loading: false,
    error: null,
    lastFetched: null,
};

const packagesSlice = createSlice({
    name: 'packages',
    initialState,
    reducers: {
        setAllPackages: (state, action) => {
            state.allPackages = action.payload;
            state.lastFetched = Date.now();
        },
        setSelectedPackage: (state, action) => {
            state.fetchSelectedPackage = action.payload;
        },
        setNewPackageItinerary: (state, action) => {
            state.fetchNewPackageItinerary = action.payload;
        },
        setNewPackageInfo: (state, action) => {
            state.fetchNewPackageInfo = {
                ...state.fetchNewPackageInfo,
                ...action.payload,
            };
        },
        setCheckItinery: (state, action) => {
            state.checkItinery = action.payload;
        },
        setCheckReach: (state, action) => {
            state.checkReach = action.payload;
        },
        addPackageToStore: (state, action) => {
            state.allPackages.push(action.payload);
        },
        updatePackageInStore: (state, action) => {
            const index = state.allPackages.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.allPackages[index] = action.payload;
            }
        },
        removePackageFromStore: (state, action) => {
            state.allPackages = state.allPackages.filter(p => p._id !== action.payload);
        },
        removePackageInfo: (state) => {
            state.fetchNewPackageInfo = {};
        },
        removePackageItinerary: (state) => {
            state.fetchNewPackageItinerary = {};
        },
        removeSelectedPackage: (state) => {
            state.fetchSelectedPackage = {};
        },
        clearPackages: (state) => {
            state.allPackages = [];
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all packages
            .addCase(fetchAllPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.allPackages = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchAllPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add package
            .addCase(addPackageAsync.fulfilled, (state, action) => {
                state.allPackages.push(action.payload);
            })
            // Update package
            .addCase(updatePackageAsync.fulfilled, (state, action) => {
                const index = state.allPackages.findIndex(p => p._id === action.payload.id);
                if (index !== -1) {
                    state.allPackages[index] = action.payload.data;
                }
            })
            // Delete package
            .addCase(deletePackageAsync.fulfilled, (state, action) => {
                state.allPackages = state.allPackages.filter(p => p._id !== action.payload);
            });
    },
});

export const {
    setAllPackages,
    setSelectedPackage,
    setNewPackageItinerary,
    setNewPackageInfo,
    setCheckItinery,
    setCheckReach,
    addPackageToStore,
    updatePackageInStore,
    removePackageFromStore,
    removePackageInfo,
    removePackageItinerary,
    removeSelectedPackage,
    clearPackages,
} = packagesSlice.actions;

// Selectors
export const selectAllPackages = (state) => state.package.allPackages;
export const selectPackagesLoading = (state) => state.package.loading;
export const selectPackagesError = (state) => state.package.error;
export const selectPackagesLastFetched = (state) => state.package.lastFetched;

export default packagesSlice.reducer;