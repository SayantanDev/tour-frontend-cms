import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllplaces, insertPlace, updatePlace, deletePlace } from '../../api/placeApi';

// Async thunks for API calls
export const fetchAllPlaces = createAsyncThunk(
    'places/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllplaces();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addPlaceAsync = createAsyncThunk(
    'places/add',
    async (placeData, { rejectWithValue }) => {
        try {
            const response = await insertPlace(placeData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePlaceAsync = createAsyncThunk(
    'places/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updatePlace(data, id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePlaceAsync = createAsyncThunk(
    'places/delete',
    async (id, { rejectWithValue }) => {
        try {
            await deletePlace(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    allPlaces: [],
    fetchSelectedPlace: {},
    loading: false,
    error: null,
    lastFetched: null,
};

const placesSlice = createSlice({
    name: 'places',
    initialState,
    reducers: {
        setAllPlaces: (state, action) => {
            state.allPlaces = action.payload;
            state.lastFetched = Date.now();
        },
        setSelectedPlace: (state, action) => {
            state.fetchSelectedPlace = action.payload;
        },
        addPlaceToStore: (state, action) => {
            state.allPlaces.push(action.payload);
        },
        updatePlaceInStore: (state, action) => {
            const index = state.allPlaces.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.allPlaces[index] = action.payload;
            }
        },
        removePlaceFromStore: (state, action) => {
            state.allPlaces = state.allPlaces.filter(p => p._id !== action.payload);
        },
        removeSelectedPlace: (state) => {
            state.fetchSelectedPlace = {};
        },
        clearPlaces: (state) => {
            state.allPlaces = [];
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all places
            .addCase(fetchAllPlaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPlaces.fulfilled, (state, action) => {
                state.loading = false;
                state.allPlaces = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchAllPlaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add place
            .addCase(addPlaceAsync.fulfilled, (state, action) => {
                state.allPlaces.push(action.payload);
            })
            // Update place
            .addCase(updatePlaceAsync.fulfilled, (state, action) => {
                const index = state.allPlaces.findIndex(p => p._id === action.payload.id);
                if (index !== -1) {
                    state.allPlaces[index] = action.payload.data;
                }
            })
            // Delete place
            .addCase(deletePlaceAsync.fulfilled, (state, action) => {
                state.allPlaces = state.allPlaces.filter(p => p._id !== action.payload);
            });
    },
});

export const {
    setAllPlaces,
    setSelectedPlace,
    addPlaceToStore,
    updatePlaceInStore,
    removePlaceFromStore,
    removeSelectedPlace,
    clearPlaces,
} = placesSlice.actions;

// Selectors
export const selectAllPlaces = (state) => state.place.allPlaces;
export const selectPlacesLoading = (state) => state.place.loading;
export const selectPlacesLastFetched = (state) => state.place.lastFetched;

export default placesSlice.reducer;