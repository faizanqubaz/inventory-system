
import { createSlice } from "@reduxjs/toolkit";
import type { PurchaseRequestData } from "@/types/dashboard.type";
import { fetchPurchaseRequests } from "@/thunk/purchaseRequests.thunk";

interface PurchaseRequestsState {
  requests: PurchaseRequestData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PurchaseRequestsState = {
  requests: [],
  isLoading: false,
  error: null,
};

const purchaseRequestsSlice = createSlice({
  name: "purchaseRequests",
  initialState,
  reducers: {
    clearPurchaseRequestsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchPurchaseRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to load purchase requests.";
      });
  },
});

export const { clearPurchaseRequestsError } =
  purchaseRequestsSlice.actions;

export default purchaseRequestsSlice.reducer;
