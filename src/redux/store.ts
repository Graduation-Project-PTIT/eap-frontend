import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import classManagementReducer from "./features/classManagement/classManagementSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    classManagement: classManagementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
