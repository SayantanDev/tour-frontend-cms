import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { configString } from '../../api/configApi';

// Async thunk for fetching config
export const fetchConfig = createAsyncThunk(
    'config/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await configString();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    configData: {},
    loading: false,
    error: null,
    lastFetched: null,
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setConfigData: (state, action) => {
            state.configData = action.payload;
            state.lastFetched = Date.now();
        },
        removeConfigData: (state) => {
            state.configData = {};
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConfig.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.configData = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setConfigData, removeConfigData } = configSlice.actions;

// Selectors
export const selectConfigData = (state) => state.config.configData;
export const selectConfigLoading = (state) => state.config.loading;
export const selectConfigLastFetched = (state) => state.config.lastFetched;

export default configSlice.reducer;
