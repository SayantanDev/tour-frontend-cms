import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllHotels, insertHotel, updateHotel, deleteHotel } from '../../api/hotelsAPI';

// Async thunks for API calls
export const fetchAllHotels = createAsyncThunk(
    'hotels/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllHotels();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addHotelAsync = createAsyncThunk(
    'hotels/add',
    async (hotelData, { rejectWithValue }) => {
        try {
            const response = await insertHotel(hotelData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateHotelAsync = createAsyncThunk(
    'hotels/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updateHotel(id, data);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteHotelAsync = createAsyncThunk(
    'hotels/delete',
    async (id, { rejectWithValue }) => {
        try {
            await deleteHotel(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    allHotels: [],
    selectedHotel: null,
    loading: false,
    error: null,
    lastFetched: null,
};

const hotelsSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        setAllHotels: (state, action) => {
            state.allHotels = action.payload;
            state.lastFetched = Date.now();
        },
        setSelectedHotel: (state, action) => {
            state.selectedHotel = action.payload;
        },
        setHotelsLoading: (state, action) => {
            state.loading = action.payload;
        },
        setHotelsError: (state, action) => {
            state.error = action.payload;
        },
        addHotel: (state, action) => {
            state.allHotels.push(action.payload);
        },
        updateHotelInStore: (state, action) => {
            const index = state.allHotels.findIndex(h => h._id === action.payload._id);
            if (index !== -1) {
                state.allHotels[index] = action.payload;
            }
        },
        removeHotel: (state, action) => {
            state.allHotels = state.allHotels.filter(h => h._id !== action.payload);
        },
        clearHotels: (state) => {
            state.allHotels = [];
            state.selectedHotel = null;
            state.error = null;
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all hotels
            .addCase(fetchAllHotels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllHotels.fulfilled, (state, action) => {
                state.loading = false;
                state.allHotels = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchAllHotels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add hotel
            .addCase(addHotelAsync.fulfilled, (state, action) => {
                state.allHotels.push(action.payload);
            })
            // Update hotel
            .addCase(updateHotelAsync.fulfilled, (state, action) => {
                const index = state.allHotels.findIndex(h => h._id === action.payload.id);
                if (index !== -1) {
                    state.allHotels[index] = action.payload.data;
                }
            })
            // Delete hotel
            .addCase(deleteHotelAsync.fulfilled, (state, action) => {
                state.allHotels = state.allHotels.filter(h => h._id !== action.payload);
            });
    },
});

export const {
    setAllHotels,
    setSelectedHotel,
    setHotelsLoading,
    setHotelsError,
    addHotel,
    updateHotelInStore,
    removeHotel,
    clearHotels,
} = hotelsSlice.actions;

// Selectors
export const selectAllHotels = (state) => state.hotels.allHotels;
export const selectHotelsLoading = (state) => state.hotels.loading;
export const selectHotelsError = (state) => state.hotels.error;
export const selectHotelsLastFetched = (state) => state.hotels.lastFetched;

export default hotelsSlice.reducer;
