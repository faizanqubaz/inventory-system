
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface PurchaseRequestPayload {
  itemName: string;
  category: string;
  quantity: string;
  amount: string;
  description: string;
  date: string;
  receipt: File | null;
  employeeId:string
}

export const createPurchaseRequest = createAsyncThunk(
  "purchaseRequests/create",
  async (data: PurchaseRequestPayload, { rejectWithValue }) => {
    try {
        console.log('data',data)
      const formData = new FormData();

      formData.append("itemName", data.itemName);
      formData.append("category", data.category);
      formData.append("quantity", data.quantity);
      formData.append("amount", data.amount);
      formData.append("description", data.description);
      formData.append("date", data.date);
      formData.append("employeeId", data.employeeId);

      if (data.receipt instanceof File) {
        formData.append("receipt", data.receipt);
      }

      // FormData contents are not displayed clearly by console.log(formData)
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axios.post(
        "/api/employees/purchase-requests",
        formData
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Purchase request API error:", error.response?.data);

        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to submit purchase request"
        );
      }

      return rejectWithValue("Something went wrong");
    }
  }
);
