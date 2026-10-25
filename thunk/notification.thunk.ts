
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface NotificationData {
  _id: string;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export const fetchNotifications = createAsyncThunk<
  NotificationData[],
  void,
  { rejectValue: string }
>(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/notifications", {
        headers: { "Cache-Control": "no-cache" },
      });

      // Adjust this if your API returns a different response structure.
      const notifications =
        response.data.notifications ?? response.data;

      if (!Array.isArray(notifications)) {
        return rejectWithValue("Invalid notifications response");
      }

      return notifications;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? "Failed to fetch notifications"
        );
      }

      return rejectWithValue("Something went wrong");
    }
  }
);
