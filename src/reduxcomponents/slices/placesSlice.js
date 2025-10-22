import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPlace: {},
    allPlaces: [],
};

const Places = createSlice({
    name: 'places',
    initialState: initialeditState,
    reducers: {
        setSelectedPlace: (state, action) => {
            state.fetchSelectedPlace = action.payload;
        },

        removeSelectedPlace: (state, action) => {
            state.fetchSelectedPlace = {};
        },

        fetchAllPlaces: (state, action) => {
            state.allPlaces = action.payload;
        },
    }
});

export const { setSelectedPlace, removeSelectedPlace, fetchAllPlaces } = Places.actions;
export default Places.reducer;