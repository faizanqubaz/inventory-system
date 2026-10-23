
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { PurchaseRequestData } from "@/types/dashboard.type";

export const fetchPurchaseRequests = createAsyncThunk<
  PurchaseRequestData[],
  void,
  { rejectValue: string }
>(
  "purchaseRequests/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/requests", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to fetch purchase requests."
        );
      }

      return response.data.requests as PurchaseRequestData[];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch purchase requests."
        );
      }

      return rejectWithValue("Something went wrong.");
    }
  }
);
