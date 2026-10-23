
"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MyHeading from "@/components/common/heading";
import { useAppDispatch } from "@/store/hook";
import { activateEmployee } from "@/thunk/employees.thunk";

export default function ActivationForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("The activation link is invalid or missing.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        activateEmployee({
          token,
          password,
        })
      ).unwrap();

      router.replace("/login?activated=1");
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : "Account activation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
          <MyHeading
            headingcls="text-2xl font-bold"
            children="Invalid activation link"
          />

          <p className="mt-3 text-gray-600">
            Please use the complete activation link from your email.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <MyHeading
          headingcls="text-2xl font-bold text-gray-900"
          children="Activate your account"
        />

        <p className="mt-2 text-sm text-gray-600">
          Create a password to activate your employee account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              New password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              placeholder="Enter a new password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Activating account..." : "Activate account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Your activation link can only be used once and expires after 24 hours.
        </p>
      </div>
    </main>
  );
}
