import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  applications: [],
  panels: [],
  feedback: [],
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setApplications(state, action) {
      state.applications = action.payload;
    },
    addApplication(state, action) {
      state.applications.push(action.payload);
    },
    updateApplication(state, action) {
      const index = state.applications.findIndex((app) => app._id === action.payload._id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    setPanels(state, action) {
      state.panels = action.payload;
    },
    addPanel(state, action) {
      state.panels.push(action.payload);
    },
    setFeedback(state, action) {
      state.feedback = action.payload;
    },
    addFeedback(state, action) {
      state.feedback.push(action.payload);
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setApplications,
  addApplication,
  updateApplication,
  setPanels,
  addPanel,
  setFeedback,
  addFeedback,
  setError,
} = applicationSlice.actions;
export default applicationSlice.reducer;
