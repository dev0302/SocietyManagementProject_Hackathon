import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import societyReducer from "./slices/societySlice";
import applicationReducer from "./slices/applicationSlice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    society: societyReducer,
    application: applicationReducer,
  },
});

export default store;

