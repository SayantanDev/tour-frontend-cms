import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedCtgPackage: {},
    
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
        }
    }
});

export const { setSelectedCtgPakage,removeSelectedCtgPackage } = Ctgpakage.actions;
export default Ctgpakage.reducer;