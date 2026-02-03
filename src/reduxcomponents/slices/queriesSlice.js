import { createSlice } from '@reduxjs/toolkit';

const initialLoginState = {
    fetchSelectedquerie: {},
};


const loginSlice = createSlice({
    name: 'querie',
    initialState: initialLoginState,
    reducers: {
        setSelectedquerie: (state, action) => {
            state.fetchSelectedquerie = action.payload;
        }
       
    }
});

export const { setSelectedquerie } = loginSlice.actions;
export default loginSlice.reducer;