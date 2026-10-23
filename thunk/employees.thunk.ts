
import { EmployeeActivationData, EmployeeFormData } from "@/types/employee.type";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


// Fetch employees
export const fetchEmployees = createAsyncThunk(
  "/api/admin/employees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/employees");
      return response.data.employees;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees"
      );
    }
  }
);

// Add employee
export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async (employee: EmployeeFormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/admin/employees",
        employee
      ); 
      return response.data.employee;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add employee"
      );
    }
  }
);



// Activate employee account
export const activateEmployee = createAsyncThunk(
  "employees/activateEmployee",
  async (data: EmployeeActivationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/auth/activate-employee",
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Account activation failed."
      );
    }
  }
);