import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedCtgPackage: {},
    allPermission: [],
};

const Ctgpakage = createSlice({
    name: 'Ctgpakage',
    initialState: initialeditState,
    reducers: {
        setSelectedCtgPakage: (state, action) => {
            state.fetchSelectedCtgPackage = action.payload;
        },
       
        removeSelectedCtgPackage: (state, action) => {
            state.fetchSelectedCtgPackage = {};
        },
        setSelectedPermission: (state, action) => {
            state.allPermission = action.payload;
        },
    }
});

export const { setSelectedCtgPakage,removeSelectedCtgPackage,setSelectedPermission} = Ctgpakage.actions;
export default Ctgpakage.reducer;