
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { LoginData, LoginResponse } from "@/types/login-data.type";



export const Login = createAsyncThunk<
  LoginResponse,
  LoginData,
  { rejectValue: string }
>(
  "/api/user",
  async (data, thunkAPI) => {
    try {
      const response = await axios.post<LoginResponse>(
        "/api/user",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log('responsedata',response.data)
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Login request failed";

        console.error("API error:", message);

        return thunkAPI.rejectWithValue(message);
      }

      return thunkAPI.rejectWithValue("An unexpected error occurred");
    }
  }
);



