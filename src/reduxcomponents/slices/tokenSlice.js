import { createSlice } from '@reduxjs/toolkit';

const tokenSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    refreshToken: null,
    user: null
  },
  reducers: {
    addLoginToken: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    logoutUser: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
});

export const { addLoginToken, logoutUser } = tokenSlice.actions;
export default tokenSlice.reducer;
