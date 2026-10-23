import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authslice";
import employeeeReducer from './slice/employeesslice'
import dashboardReducer from './slice/dashboard.slice'
import purchaseRequestsReducer from './slice/purchaseRequests.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    employees: employeeeReducer,
    purchaseRequests: purchaseRequestsReducer,

  },
});

// These types come from the configured store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;