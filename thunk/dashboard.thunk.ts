import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { DashboardStats } from "@/types/dashboard.type";

export const fetchDashboardStats = createAsyncThunk<
  DashboardStats,
  void,
  { rejectValue: string }
>(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/dashboard/stats");

      return response.data.stats as DashboardStats;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch dashboard statistics."
        );
      }

      return rejectWithValue("Something went wrong.");
    }
  }
);