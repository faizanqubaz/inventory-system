
"use client";

import { useState } from "react";
import MyButton from "@/components/common/button";
import MyInput from "@/components/common/input";
import { EmployeeFormData, EmployeeFormProps } from "@/types/employee.type";



export default function EmployeeForm({
  onClose,
  onSubmit,
  error,
  isSubmitting,
}: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>({
    name: "",
    email: "",
    department: "",
    phone: "",
    position: "",
    status: "active",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Employee
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the employee information below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close form"
            className="rounded-lg p-2 text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* API Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span className="font-bold">!</span>

              <p>{error}</p>
            </div>
          )}

          {/* Employee Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Employee Name
            </label>

            <MyInput
              name="name"
              value={form.name}
              handleChange={handleChange}
              placeholder="Enter employee name"
              inpcls={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>

            <MyInput
              name="email"
              value={form.email}
              handleChange={handleChange}
              placeholder="employee@example.com"
              inpcls={inputClass}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>

            <MyInput
              name="phone"
              value={form.phone}
              handleChange={handleChange}
              placeholder="Enter phone number"
              inpcls={inputClass}
              required
            />
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Department
            </label>

            <MyInput
              name="department"
              value={form.department}
              handleChange={handleChange}
              placeholder="e.g. IT, Finance"
              inpcls={inputClass}
              required
            />
          </div>

          {/* Position */}
          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Position
            </label>

            <MyInput
              name="position"
              value={form.position}
              handleChange={handleChange}
              placeholder="e.g. Accountant"
              inpcls={inputClass}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <MyButton
              type="button"
              handleClick={onClose}
              btncls="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </MyButton>

            <MyButton
              type="submit"
              btncls="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Employee"}
            </MyButton>
          </div>
        </form>
      </div>
    </div>
  );
}
