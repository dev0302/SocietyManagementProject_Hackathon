import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "dark",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload || "dark";
    },
  },
});

export const { setTheme } = uiSlice.actions;
export default uiSlice.reducer;

