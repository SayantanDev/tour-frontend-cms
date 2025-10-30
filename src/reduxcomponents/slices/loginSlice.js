import { createSlice } from '@reduxjs/toolkit';

const initialLoginState = {
    user: {},
    allUsers: [],
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
        },
        addAllUsers: (state,action) => {
            state.allUsers = action.payload;
        }
    }
});

export const { addLoginUser, logoutUser, addAllUsers } = loginSlice.actions;
export default loginSlice.reducer;