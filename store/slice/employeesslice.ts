import { fetchEmployees,addEmployee } from '@/thunk/employees.thunk';
import { EmployeesState } from '@/types/employee.type';
import {createSlice} from '@reduxjs/toolkit';


const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state:any, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })


      .addCase(addEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.loading = false;

        // Add the newly created employee to Redux
        state.employees.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to add employee";
      });
  },
});


export default employeesSlice.reducer