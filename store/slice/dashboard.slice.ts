import { createSlice } from "@reduxjs/toolkit";

import { DashboardStats } from "@/types/dashboard.type";
import { fetchDashboardStats } from "@/thunk/dashboard.thunk";

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    purchasingCost: 0,
    totalPurchaseItems: 0,
    approvedRequisitions: 0,
    rejectedRequests: 0,
  },
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to load dashboard statistics.";
      });
  },
});

export default dashboardSlice.reducer;