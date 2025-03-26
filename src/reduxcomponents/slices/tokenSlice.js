import { createSlice } from '@reduxjs/toolkit';

const initialTokenState = {
    tokens: {
        token: '',
        refreshToken: '',
    }
};

const tokenSlice = createSlice({
    name: 'token',
    initialState: initialTokenState,
    reducers: {
        addLoginToken: (state, action) => {
            state.tokens = action.payload;
        },
        removeLoginToken: (state) => {
            state.tokens = {
                token: '',
                refreshToken: '',
            }
        }
    }
});

export const { addLoginToken, removeLoginToken } = tokenSlice.actions;
export default tokenSlice.reducer;