import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  societies: [],
  departments: [],
  invites: [],
  loading: false,
  error: null,
};

const societySlice = createSlice({
  name: "society",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setSocieties(state, action) {
      state.societies = action.payload;
    },
    addSociety(state, action) {
      state.societies.push(action.payload);
    },
    setDepartments(state, action) {
      state.departments = action.payload;
    },
    addDepartment(state, action) {
      state.departments.push(action.payload);
    },
    setInvites(state, action) {
      state.invites = action.payload;
    },
    addInvite(state, action) {
      state.invites.push(action.payload);
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setSocieties,
  addSociety,
  setDepartments,
  addDepartment,
  setInvites,
  addInvite,
  setError,
} = societySlice.actions;
export default societySlice.reducer;
