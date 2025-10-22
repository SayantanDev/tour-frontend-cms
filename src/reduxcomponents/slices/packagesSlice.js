import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPackage: {},
    fetchNewPackageInfo: {},
    fetchNewPackageItinerary: {},
    checkItinery: false,
    checkReach: false,
    allPackages: [],
    loading: false,
    error: null
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
        updatePackageVerified: (state, action) => {
            const { id, verified } = action.payload;
            const pkg = state.allPackages.find(p => p._id === id);
            if (pkg) pkg.verified = verified;
        },
        updatepackageRanking: (state, action) => {
            const { id, ranking } = action.payload;
            const pkg = state.allPackages.find(p => p._id === id);
            if (pkg) pkg.ranking = ranking;
        },
        fetchAllPackages: (state, action) => {
            state.allPackages = action.payload;
        }
    }
});

export const { setSelectedPackage, setNewPackageItinerary, setNewPackageInfo, removePackageInfo, removePackageItinerary, setCheckItinery, setCheckReach, removeSelectedPackage, updatePackageVerified, updatepackageRanking, fetchAllPackages } = Packages.actions;
export default Packages.reducer;