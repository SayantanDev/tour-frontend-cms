import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPackage: {},
    fetchNewPackageInfo: {},
};

const Packages = createSlice({
    name: 'packages',
    initialState: initialeditState,
    reducers: {
        setSelectedPackage: (state, action) => {
            state.fetchSelectedPackage = action.payload;
        },
        setNewPackageInfo: (state, action) => {
            state.fetchNewPackageInfo = {
                ...state.fetchNewPackageInfo,
                ...action.payload,
            };
        },
        removePackageInfo: (state, action) => {
            delete state.fetchNewPackageInfo[action.payload];
        }
    }
});

export const { setSelectedPackage, setNewPackageInfo, removePackageInfo } = Packages.actions;
export default Packages.reducer;