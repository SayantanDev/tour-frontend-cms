import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPlace: {},
    loading: false,
    allPlaces: [],
    placesPagination: {
        totalPages: 0,
        currentPage: 1,
        totalItems: 0
    }
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
        setAllPlaces: (state, action) => {
            state.allPlaces = action.payload.data || action.payload;
            if (action.payload.pagination) {
                state.placesPagination = action.payload.pagination;
            } else if (action.payload.totalPages) {
                state.placesPagination = {
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage || 1,
                    totalItems: action.payload.totalItems || 0
                };
            }
        },
        addPlaceToStore: (state, action) => {
            state.allPlaces = [action.payload, ...state.allPlaces];
        },
        updatePlaceInStore: (state, action) => {
            const index = state.allPlaces.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.allPlaces[index] = action.payload;
            }
        },
        removePlaceFromStore: (state, action) => {
            state.allPlaces = state.allPlaces.filter(p => p._id !== action.payload);
        }
    }
});

export const { 
    setSelectedPlace, 
    removeSelectedPlace, 
    setAllPlaces, 
    addPlaceToStore, 
    updatePlaceInStore, 
    removePlaceFromStore 
} = Places.actions;
export default Places.reducer;