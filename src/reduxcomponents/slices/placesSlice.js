import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPlace: {},
    
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
        }
    }
});

export const { setSelectedPlace,removeSelectedPlace } = Places.actions;
export default Places.reducer;