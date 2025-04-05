import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: JSON.parse(localStorage.getItem("notifications")) || [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.list.push(action.payload);
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    removeNotification: (state, action) => {
      state.list = state.list.filter(n => n.notifiId !== action.payload);
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    removeAllNotifications: (state, action) => {
      state.list = [];
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    setNotifications: (state, action) => {
      state.list = action.payload;
      localStorage.setItem("notifications", JSON.stringify(action.payload));
    },
  },
});

export const { addNotification, removeNotification, setNotifications,removeAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;