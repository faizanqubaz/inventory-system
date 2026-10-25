
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  type NotificationData,
} from "@/thunk/notification.thunk";

interface NotificationState {
  notifications: NotificationData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    updateNotificationReadStatus: (state, action) => {
      const notification = state.notifications.find(
        (item) => item._id === action.payload.id
      );

      if (notification) {
        notification.isRead = action.payload.isRead;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? "Failed to fetch notifications";
      });
  },
});

export const { updateNotificationReadStatus } =
  notificationSlice.actions;

export default notificationSlice.reducer;
