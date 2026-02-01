import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPackage: {},
    fetchNewPackageInfo: {},
    fetchNewPackageItinerary: {},
    checkItinery: false,
    checkReach: false,
    loading: false,
    allPackages: [],
};

const Packages = createSlice({
    name: 'packages',
    initialState: initialeditState,
    reducers: {
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
        removePackageInfo: (state, action) => {
            // delete state.fetchNewPackageInfo[action.payload];
            state.fetchNewPackageInfo = {};
        },
        removePackageItinerary: (state, action) => {
            // delete state.fetchNewPackageItinerary[action.payload];
            state.fetchNewPackageItinerary = {};
        },
        removeSelectedPackage: (state, action) => {
            state.fetchSelectedPackage = {};
        },
        setAllPackages: (state, action) => {
            state.allPackages = action.payload;
        }
    }
});

export const { setSelectedPackage, setNewPackageItinerary, setNewPackageInfo, removePackageInfo, removePackageItinerary, setCheckItinery, setCheckReach, removeSelectedPackage, setAllPackages } = Packages.actions;
export default Packages.reducer;