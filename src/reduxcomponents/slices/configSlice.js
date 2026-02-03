// src/reduxcomponents/slices/configSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    configData: {},
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setConfigData: (state, action) => {
            state.configData = action.payload;
        },
        removeConfigData: (state) => {
            state.configData = {};
        }
    },
});

export const { setConfigData, removeConfigData } = configSlice.actions;
export default configSlice.reducer;
