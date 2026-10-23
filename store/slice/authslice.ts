
import { Login } from "@/thunk/login.thunk";
import { createSlice } from "@reduxjs/toolkit";

export interface LoginUser {
  id: string;
  email: string;
  role: string;
}
interface InitialStateI {
  user: LoginUser | null;
  isLoading: boolean;
  submitSuccess: boolean;
  deleteSuccess: boolean;
  error: string | null;
}

const initialState: InitialStateI = {
  user: null,
  isLoading: false,
  submitSuccess: false,
  deleteSuccess: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    logout: (state) => {
      state.user = null;
      state.submitSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(Login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(Login.fulfilled, (state:any, action) => {
        state.isLoading = false;
        console.log('action f',action.payload.user)
        state.user = action.payload.user;
        state.submitSuccess = true;
      })
      .addCase(Login.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || action.error.message || "Login failed";
        state.submitSuccess = false;
      });
  },
});

export const { setSubmitSuccess, logout } = userSlice.actions;
export default userSlice.reducer;
