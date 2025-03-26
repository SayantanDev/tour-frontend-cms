import { createSlice } from '@reduxjs/toolkit';

const initialeditState = {
    fetchSelectedPackage: {},
};

const EditPackage = createSlice({
    name: 'inquiry',
    initialState: initialeditState,
    reducers: {
        setSelectedPackage: (state, action) => {
            state.fetchSelectedPackage = action.payload;
        }
       
    }
});

export const { setSelectedPackage } = EditPackage.actions;
export default EditPackage.reducer;