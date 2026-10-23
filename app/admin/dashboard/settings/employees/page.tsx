
"use client";

import { useEffect, useState } from "react";
import MyButton from "@/components/common/button";
import MyHeading from "@/components/common/heading";
import MyInput from "@/components/common/input";
import EmployeeTable from "@/components/ui/employee-table";
import { fetchEmployees, addEmployee } from "@/thunk/employees.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { EmployeeFormData } from "@/types/employee.type";
import EmployeeForm from "@/components/ui/create-employe-form";




export default function EmployeesPage() {
  const dispatch = useAppDispatch();

  const {
    employees = [],
    loading,
    error,
  } = useAppSelector((state) => state.employees);

  // Add Employee modal
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Fetch employees
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Calculate dashboard statistics and descriptions
  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status?.toLowerCase() === "active"
  ).length;

  const totalDepartments = new Set(
    employees
      .map((employee) => employee.department?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const boxes = [
    {
      id: 1,
      title: "Total Employees",
      count: totalEmployees,
      desc: "All registered employees",
    },
    {
      id: 2,
      title: "Active Employees",
      count: activeEmployees,
      desc: `${totalEmployees - activeEmployees} inactive employees`,
    },
    {
      id: 3,
      title: "Departments",
      count: totalDepartments,
      desc: "Departments represented",
    },
  ];

  // Search employees
  const filteredEmployees = employees.filter((employee) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return true;

    return [
      employee.name,
      employee.email,
      employee.department,
      employee.phone,
      employee.position,
    ].some((value) => value?.toLowerCase().includes(searchValue));
  });

  // Open Add Employee modal
  const handleClick = () => {
    setFormError("");
    setShowEmployeeForm(true);
  };

  // Create employee using Redux thunk
  const handleAddEmployee = async (employee: EmployeeFormData) => {
    setFormError("");
    setIsSubmitting(true);

    try {
      await dispatch(addEmployee(employee)).unwrap();

      // Employee has been added to Redux by the slice
      setShowEmployeeForm(false);
      setFormError("");
    } catch (error: unknown) {
      setFormError(
        typeof error === "string"
          ? error
          : "Failed to add employee. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              AccountFlow
              <span className="mx-2 text-gray-300">/</span>
              Administration
            </p>

            <MyHeading
              children="Employees"
              headingcls="text-3xl font-bold tracking-tight text-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              Manage employee profiles, accounts, and access permissions.
            </p>
          </div>

          <MyButton
            type="button"
            btncls="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            handleClick={handleClick}
          >
            + Add Employee
          </MyButton>
        </div>

        {/* Dashboard Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boxes.map((box) => (
            <div
              key={box.id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <p className="text-sm font-medium text-gray-500">
                {box.title}
              </p>

              <h2 className="my-3 text-3xl font-bold tracking-tight text-gray-900">
                {box.count}
              </h2>

              <p className="text-xs text-gray-400">{box.desc}</p>

              <div className="mt-5 h-1 w-12 rounded-full bg-emerald-500 transition-all group-hover:w-20" />
            </div>
          ))}
        </div>

        {/* Employees Directory */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Directory Header */}
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <MyHeading
                children="Employees Directory"
                headingcls="text-lg font-bold text-gray-900"
              />

              <p className="mt-1 text-sm text-gray-500">
                Employee information and account status.
              </p>
            </div>

            <div className="w-full lg:max-w-sm">
              <MyInput
                name="search"
                value={search}
                handleChange={handleSearchChange}
                inpcls="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Search employees..."
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading employees...
            </div>
          )}

          {/* Fetch Error */}
          {!loading && error && (
            <div
              role="alert"
              className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {typeof error === "string"
                ? error
                : "Failed to load employees."}
            </div>
          )}

          {/* Employee Table */}
          {!loading && !error && (
            <>
              <EmployeeTable employees={filteredEmployees} />

              {search.trim() && (
                <div className="border-t border-gray-100 px-6 py-3 text-sm text-gray-500">
                  Showing {filteredEmployees.length} matching employees
                  out of {employees.length}.
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Add Employee Modal */}
      {showEmployeeForm && (
        <EmployeeForm
          onClose={() => {
            if (!isSubmitting) {
              setShowEmployeeForm(false);
              setFormError("");
            }
          }}
          onSubmit={handleAddEmployee}
          error={formError}
          isSubmitting={isSubmitting}
        />
      )}
    </main>
  );
}
