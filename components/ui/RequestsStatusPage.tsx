
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  LoaderCircle,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import { fetchPurchaseRequests } from "@/thunk/purchaseRequests.thunk";
import { fetchDashboardStats } from "@/thunk/dashboard.thunk";
import type { PurchaseRequestData } from "@/types/dashboard.type";
import {
  formatCurrency,
  formatDate,
  getEmployeeName,
} from "@/libs/reusable";
import AdminSidebar from "./AdminSidebar";


type RequestStatus = "pending" | "approved" | "rejected";

interface RequestsStatusPageProps {
  status: RequestStatus;
}

const pageDetails: Record<
  RequestStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Pending Requests",
    description: "Review employee purchase requests awaiting approval.",
  },
  approved: {
    title: "Approved Requests",
    description: "View approved requisitions and their current status.",
  },
  rejected: {
    title: "Rejected Requests",
    description: "Review rejected requisitions.",
  },
};

export default function RequestsStatusPage({
  status,
}: RequestsStatusPageProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { requests, isLoading, error } = useSelector(
    (state: RootState) => state.purchaseRequests
  );

  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void dispatch(fetchPurchaseRequests());
  }, [dispatch]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (request.status?.toLowerCase() !== status) {
        return false;
      }

      if (!query) {
        return true;
      }

      const employeeName = getEmployeeName(request) || "";

      return (
        request.itemName?.toLowerCase().includes(query) ||
        request.category?.toLowerCase().includes(query) ||
        employeeName.toLowerCase().includes(query) ||
        request.description?.toLowerCase().includes(query)
      );
    });
  }, [requests, search, status]);

  const refreshRequests = async () => {
    setRefreshing(true);
    setPageError("");
    setSuccess("");

    try {
      const [requestsResult, statsResult] = await Promise.all([
        dispatch(fetchPurchaseRequests()),
        dispatch(fetchDashboardStats()),
      ]);

      if (fetchPurchaseRequests.rejected.match(requestsResult)) {
        throw new Error(
          typeof requestsResult.payload === "string"
            ? requestsResult.payload
            : "Failed to refresh purchase requests."
        );
      }

      if (fetchDashboardStats.rejected.match(statsResult)) {
        throw new Error(
          typeof statsResult.payload === "string"
            ? statsResult.payload
            : "Requests refreshed, but dashboard statistics failed to refresh."
        );
      }
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : "Failed to refresh requests."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (
    purchaseRequest: PurchaseRequestData,
    newStatus: "approved" | "rejected"
  ) => {
    if (actionId) return;

    setActionId(purchaseRequest._id);
    setPageError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/requests/${purchaseRequest._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update request status.");
      }

      const [requestsResult, statsResult] = await Promise.all([
        dispatch(fetchPurchaseRequests()),
        dispatch(fetchDashboardStats()),
      ]);

      if (fetchPurchaseRequests.rejected.match(requestsResult)) {
        throw new Error(
          "The status was updated, but the requests list could not refresh."
        );
      }

      if (fetchDashboardStats.rejected.match(statsResult)) {
        setPageError(
          "The status was updated, but dashboard statistics could not refresh."
        );
      } else {
        setSuccess(`Request ${newStatus} successfully.`);
      }
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : "Failed to update request."
      );
    } finally {
      setActionId(null);
    }
  };

  const details = pageDetails[status];

  const statusStyle =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700"
      : status === "rejected"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-slate-200 p-2 lg:hidden"
              >
                <span className="text-lg">☰</span>
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {details.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {details.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refreshRequests()}
              disabled={refreshing || isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {pageError && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{pageError}</span>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setPageError("")}
              >
                <XCircle size={17} />
              </button>
            </div>
          )}

          {error && !pageError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {success}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">
                  {details.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredRequests.length} matching request(s)
                </p>
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search item or employee..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#063d43] focus:ring-2 focus:ring-[#063d43]/10"
                />
              </div>
            </div>

            {isLoading && requests.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
                <LoaderCircle size={20} className="animate-spin" />
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <CheckCircle size={32} className="mb-3 text-slate-300" />
                <p className="font-medium text-slate-700">
                  No {status} requests found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search or refresh the page.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-3 font-semibold">Item</th>
                      <th className="px-3 py-3 font-semibold">Employee</th>
                      <th className="px-3 py-3 font-semibold">Quantity</th>
                      <th className="px-3 py-3 font-semibold">Amount</th>
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-slate-50">
                        <td className="px-3 py-4">
                          <p className="font-semibold text-slate-800">
                            {request.itemName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {request.category}
                          </p>
                          {request.description && (
                            <p className="mt-1 max-w-xs text-xs text-slate-500">
                              {request.description}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {getEmployeeName(request)}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {request.quantity}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 font-semibold">
                          {formatCurrency(Number(request.amount) || 0)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                          {formatDate(request.date || request.createdAt)}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Change status for ${request.itemName}`}
                              value={request.status}
                              disabled={actionId === request._id}
                              onChange={(event) => {
                                const value = event.target.value;

                                if (
                                  value === "approved" ||
                                  value === "rejected"
                                ) {
                                  void updateStatus(request, value);
                                }
                              }}
                              className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#063d43] disabled:opacity-50"
                            >
                              <option value="pending" disabled>
                                Pending
                              </option>
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                            </select>

                            {actionId === request._id && (
                              <LoaderCircle
                                size={16}
                                className="animate-spin text-slate-500"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
