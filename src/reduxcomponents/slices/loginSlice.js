import { createSlice } from '@reduxjs/toolkit';

const initialLoginState = {
    user: {},
};

const loginSlice = createSlice({
    name: 'login',
    initialState: initialLoginState,
    reducers: {
        addLoginUser: (state, action) => {
            state.user = action.payload;
        },
        logoutUser: (state) => {
            state.user = {};
        }
    }
});

export const { addLoginUser, logoutUser } = loginSlice.actions;
export default loginSlice.reducer;