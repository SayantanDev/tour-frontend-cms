import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allHotels: [],
    selectedHotel: null,
    loading: false,
    error: null,
};

const hotelsSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        setAllHotels: (state, action) => {
            state.allHotels = action.payload;
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
        clearHotels: (state) => {
            state.allHotels = [];
            state.selectedHotel = null;
            state.error = null;
        },
    },
});

export const {
    setAllHotels,
    setSelectedHotel,
    setHotelsLoading,
    setHotelsError,
    clearHotels,
} = hotelsSlice.actions;

export default hotelsSlice.reducer;
