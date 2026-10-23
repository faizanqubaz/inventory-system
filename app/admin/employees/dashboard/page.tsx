"use client";

import { useCallback, useEffect, useState } from "react";
import MyHeading from "@/components/common/heading";
import { ShoppingCart, FileText } from "lucide-react";
import EmplyeeRequestFrom from "@/components/ui/employee-requestform";
import { useAppSelector } from "@/store/hook";

type PurchaseRequest = {
  id: string;
  itemName: string;
  category: string;
  quantity: number | string;
  amount: number | string;
  date: string;
  status: "pending" | "approved" | "rejected" | string;
};

export default function EmployeeDashboard() {
  // Get the currently logged-in employee from Redux.
  const user = useAppSelector((state:any) => state.auth.user);

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");

  // Fetch only the requests belonging to the current employee.
  const fetchMyRequests = useCallback(async () => {
    if (!user?.id) {
      setRequests([]);
      setLoadingRequests(false);
      return;
    }

    setLoadingRequests(true);
    setError("");

    try {
      const response = await fetch(
        `/api/employees/purchase-requests?employeeId=${encodeURIComponent(user.id)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your purchase requests."
        );
      }

      setRequests(data.requests ?? []);
    } catch (err) {
      console.error("Failed to fetch purchase requests:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your purchase requests."
      );
    } finally {
      setLoadingRequests(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchMyRequests();

    // Refresh the list when a new request is successfully submitted.
    const handleRequestCreated = () => {
      void fetchMyRequests();
    };

    window.addEventListener(
      "purchase-request-created",
      handleRequestCreated
    );

    return () => {
      window.removeEventListener(
        "purchase-request-created",
        handleRequestCreated
      );
    };
  }, [fetchMyRequests]);

const getStatusClasses = (status?: string) => {
  switch ((status ?? "pending").toLowerCase()) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "pending":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
};

  const formatDate = (date: string) => {
    const parsedDate = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? `${date}T12:00:00`
        : date
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Karachi",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-5 md:block">
        <div className="mb-10">
          <h2 className="text-xl font-bold tracking-tight text-teal-900">
            Employee Portal
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Accounting &amp; Procurement
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl bg-teal-800 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
        >
          <ShoppingCart size={19} />
          Request Item Purchase
        </button>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-4 sm:p-8 lg:p-10">
        <div className="mb-8">
          <MyHeading
            children="Request of Purchase"
            headingcls="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
          />

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Submit purchase requests, record expenses, and upload supporting
            receipts for review and approval.
          </p>
        </div>

        <EmplyeeRequestFrom />

        {/* Request History */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-800">
              <FileText size={21} />
            </div>

            <div>
              <MyHeading
                children="My Purchase Requests"
                headingcls="text-lg font-bold text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                View the purchase requests you have submitted.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchMyRequests()}
              disabled={loadingRequests || !user?.id}
              className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingRequests ? "Loading..." : "Refresh"}
            </button>
          </div>

          {!user?.id && (
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              Please log in to view your purchase requests.
            </p>
          )}

          {error && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void fetchMyRequests()}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Item</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Quantity</th>
                  <th className="px-5 py-4 font-semibold">Amount (PKR)</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loadingRequests ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                      Loading your purchase requests...
                    </td>
                  </tr>
                ) : requests.length > 0 ? (
                  requests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-gray-50/80"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {request.itemName}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {request.category}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {request.quantity}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-800">
                        {Number(request.amount).toLocaleString("en-PK")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(request.date)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText
                          size={32}
                          className="mb-3 text-gray-300"
                        />
                        <p className="font-medium text-gray-600">
                          No purchase requests yet
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Your submitted requests will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}