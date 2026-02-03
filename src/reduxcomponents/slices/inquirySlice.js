import { createSlice } from '@reduxjs/toolkit';

const initialLoginState = {
    fetchSelectedInquiry: {},
};

const loginSlice = createSlice({
    name: 'inquiry',
    initialState: initialLoginState,
    reducers: {
        setSelectedInquiry: (state, action) => {
            state.fetchSelectedInquiry = action.payload;
        }
       
    }
});

export const { setSelectedInquiry } = loginSlice.actions;
export default loginSlice.reducer;