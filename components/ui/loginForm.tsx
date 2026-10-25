
"use client";

import { useState } from "react";
import MyButton from "../common/button";
import MyInput from "../common/input";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { Login } from "@/thunk/login.thunk";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hook";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get loading and error from Redux
  const { isLoading, error } = useAppSelector(
    (state:any) => state.auth
  );

  const [form, setFormDetails] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isLoading) return;

    if (!form.email.trim() || !form.password) {
      return;
    }

    try {
      const response = await dispatch(Login(form)).unwrap();

const { redirectTo, user } = response;

if (!redirectTo) {
  throw new Error(
    "Login succeeded, but no dashboard was provided."
  );
}

// Validate user before accessing its properties
if (!user) {
  throw new Error("Login succeeded, but user data is missing.");
}

// Wait 2 seconds before redirecting
await new Promise((resolve) => setTimeout(resolve, 2000));

if (user.role === "employee" || user.role === "accountant") {
  const params = new URLSearchParams({
    employeeId: user.id,
  });

  router.push(`${redirectTo}?${params.toString()}`);
} else {
  router.push(redirectTo);
}
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Company email
        </label>

        <MyInput
          handleChange={handleChange}
          name="email"
          id="email"
          type="email"
          placeholder="you@company.com"
          inpcls="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/10"
          required={true}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Password
        </label>

        <MyInput
          handleChange={handleChange}
          name="password"
          id="password"
          type="password"
          placeholder="Enter your password"
          inpcls="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/10"
          required={true}
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <MyInput
            type="checkbox"
            name="rememberMe"
            inpcls="h-4 w-4 accent-green-700"
          />
          Remember me
        </label>

        <MyButton
          children="Forgot password?"
          btncls="font-semibold text-green-700 transition hover:text-green-900"
          type="button"
          handleClick={() => router.push("/forget-password")}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-indigo-700 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-900/30 focus:outline-none focus:ring-4 focus:ring-green-600/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-600 via-emerald-400 to-green-500 transition-transform duration-500 ease-out group-hover:translate-x-0" />

        {isLoading ? (
          <>
            <span className="relative h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <span className="relative">Signing you in...</span>
          </>
        ) : (
          <span className="relative flex items-center gap-2">
            Sign in
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        Secure access to your company account.
      </p>
    </form>
  );
}
