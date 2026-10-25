"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CheckCircle,
  DollarSign,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import { fetchPurchaseRequests } from "@/thunk/purchaseRequests.thunk";
import { fetchDashboardStats } from "@/thunk/dashboard.thunk";

import type {
  NotificationData,
  PurchaseRequestData,
} from "@/types/dashboard.type";

import {
  formatCurrency,
  formatDate,
  getEmployeeName,
  getRequestId,
} from "@/libs/reusable";
import AdminSidebar from "@/components/ui/AdminSidebar";
import MyButton from "@/components/common/button";
import { fetchNotifications } from "@/thunk/notification.thunk";

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Dashboard statistics from Redux
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useSelector((state: RootState) => state.dashboard);

  // Purchase requests from Redux
  const {
    requests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useSelector((state: RootState) => state.purchaseRequests);

  // Local UI state
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dashboardError, setDashboardError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Initialize the date on the client
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

// Load purchase requests, statistics, and notifications
const loadDashboard = useCallback(
  async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true); 
    }

    setDashboardError("");
    setSuccess("");

    try {
      const requestsPromise = dispatch(fetchPurchaseRequests());
      const statsPromise = dispatch(fetchDashboardStats());
      const notificationPromise = dispatch(fetchNotifications());

      const [
        requestsAction,
        statsAction,
        notificationsAction,
      ] = await Promise.all([
        requestsPromise,
        statsPromise,
        notificationPromise,
      ]);

      if (fetchPurchaseRequests.rejected.match(requestsAction)) {
        throw new Error(
          typeof requestsAction.payload === "string"
            ? requestsAction.payload
            : "Failed to load purchase requests."
        );
      }

      if (fetchDashboardStats.rejected.match(statsAction)) {
        throw new Error(
          typeof statsAction.payload === "string"
            ? statsAction.payload
            : "Failed to load dashboard statistics."
        );
      }

      if (fetchNotifications.rejected.match(notificationsAction)) {
        throw new Error(
          typeof notificationsAction.payload === "string"
            ? notificationsAction.payload
            : "Failed to load notifications."
        );
      }
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [dispatch]
);

useEffect(() => {
  void loadDashboard();
}, [loadDashboard]);

  // Calculate purchase request totals
  const requestSummary = useMemo(() => {
    const totalAmount = requests.reduce(
      (total, request) => total + (Number(request.amount) || 0),
      0
    );

    const pendingRequests = requests.filter(
      (request) => request.status === "pending"
    );

    const approvedRequests = requests.filter(
      (request) => request.status === "approved"
    );

    const rejectedRequests = requests.filter(
      (request) => request.status === "rejected"
    );

    const pendingAmount = pendingRequests.reduce(
      (total, request) => total + (Number(request.amount) || 0),
      0
    );

    const monthlyRequests = currentDate
      ? requests.filter((request) => {
          const requestDate = new Date(
            request.createdAt || request.date || ""
          );

          return (
            !Number.isNaN(requestDate.getTime()) &&
            requestDate.getMonth() === currentDate.getMonth() &&
            requestDate.getFullYear() === currentDate.getFullYear()
          );
        }).length
      : 0;

    return {
      totalRequests: requests.length,
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
      totalAmount,
      pendingAmount,
      monthlyRequests,
    };
  }, [requests, currentDate]);

  // Search and filter purchase requests
  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const employeeName = getEmployeeName(request) || "";

      const matchesSearch =
        !normalizedSearch ||
        request.itemName?.toLowerCase().includes(normalizedSearch) ||
        request.category?.toLowerCase().includes(normalizedSearch) ||
        employeeName.toLowerCase().includes(normalizedSearch) ||
        request.status?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  // Show the latest five notifications
  const recentNotifications = useMemo(
    () =>
      [...notifications]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 5),
    [notifications]
  );

  // Approve or reject a purchase request
  const updateRequestStatus = async (
    request: PurchaseRequestData,
    status: "approved" | "rejected"
  ) => {
    if (actionId) return;

    try {
      setActionId(request._id);
      setDashboardError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/requests/${request._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Failed to ${status} the request.`
        );
      }

      // Refresh requests and statistics in Redux
      const [requestsAction, statsAction] = await Promise.all([
        dispatch(fetchPurchaseRequests()),
        dispatch(fetchDashboardStats()),
      ]);

      let refreshError = "";

      if (fetchPurchaseRequests.rejected.match(requestsAction)) {
        refreshError =
          typeof requestsAction.payload === "string"
            ? requestsAction.payload
            : "Purchase requests could not refresh.";
      }

      if (fetchDashboardStats.rejected.match(statsAction)) {
        refreshError = refreshError
          ? `${refreshError} Dashboard statistics could not refresh.`
          : typeof statsAction.payload === "string"
            ? statsAction.payload
            : "Dashboard statistics could not refresh.";
      }

      // Update the associated notification locally
      setNotifications((previous) =>
        previous.map((notification) => {
          if (getRequestId(notification.requestId) !== request._id) {
            return notification;
          }

          if (
            notification.requestId &&
            typeof notification.requestId === "object"
          ) {
            return {
              ...notification,
              requestId: {
                ...notification.requestId,
                status,
              },
            };
          }

          return notification;
        })
      );

      if (refreshError) {
        setDashboardError(
          `Request ${status} successfully, but ${refreshError}`
        );
      } else {
        setSuccess(`Request ${status} successfully.`);
      }
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Failed to update request."
      );
    } finally {
      setActionId(null);
    }
  };

  // Mark a notification as read
  const markNotificationRead = async (
    notification: NotificationData
  ) => {
    try {
      setDashboardError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/notifications/${notification._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update notification."
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setSuccess("Notification marked as read.");
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Failed to update notification."
      );
    }
  };

  // Dashboard cards
  const statCards = [
    {
      label: "PURCHASING COST",
      value: formatCurrency(stats.purchasingCost),
      detail: "Total spent this month",
      icon: DollarSign,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "TOTAL PURCHASE ITEMS",
      value: `${stats.totalPurchaseItems} Units`,
      detail: "Across all requisitions",
      icon: ShoppingCart,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "APPROVED REQUISITIONS",
      value: `${stats.approvedRequisitions} Requests`,
      detail: "Approved this month",
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "REJECTED REQUESTS",
      value: `${String(stats.rejectedRequests).padStart(2, "0")} Requests`,
      detail: "Rejected requisitions",
      icon: X,
      color: "bg-red-50 text-red-700",
    },
  ];

  const displayedError =
    dashboardError || requestsError || statsError;

  const unreadNotifications = notifications.filter(
    (item) => !item.isRead
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
       
      )}

      {/* Sidebar */}
    <AdminSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  unreadNotifications={unreadNotifications}
/>

      {/* Main content */}
      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Overview of purchase requests and approvals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadDashboard(true)}
                disabled={loading || refreshing || requestsLoading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <a
                href="/admin/dashboard/notifications"
                aria-label="View notifications"
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50"
              >
                <Bell size={19} />
                {unreadNotifications > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </a>
            </div>
          </div>
        </header>

        <div className="space-y-7 p-4 sm:p-6 lg:p-8">
          {/* Error message */}
          {displayedError && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{displayedError}</span>
              <button
                type="button"
                onClick={() => setDashboardError("")}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              <span>{success}</span>
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <section>
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Purchase Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Track requests, spending, and approvals in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-500">
                          {card.label}
                        </p>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          {statsLoading ? (
                            <span className="text-base text-slate-400">
                              Loading...
                            </span>
                          ) : (
                            card.value
                          )}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${card.color}`}>
                        <Icon size={22} />
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      {card.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Requests and recent activity */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Purchase Requests
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and manage employee requests
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {filteredRequests.length} of {requests.length} requests
                </span>
              </div>

              {/* Search and status filter */}
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    placeholder="Search item, category, employee..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#063d43] focus:ring-2 focus:ring-[#063d43]/10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#063d43]"
                  aria-label="Filter requests by status"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Requests table */}
              {loading || requestsLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
                  <LoaderCircle size={20} className="animate-spin" />
                  Loading requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <ShoppingCart
                    size={32}
                    className="mb-3 text-slate-300"
                  />
                  <p className="font-medium text-slate-700">
                    No purchase requests found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another search or status filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-3 font-semibold">Item</th>
                        <th className="px-3 py-3 font-semibold">Employee</th>
                        <th className="px-3 py-3 font-semibold">Amount</th>
                        <th className="px-3 py-3 font-semibold">Date</th>
                        <th className="px-3 py-3 font-semibold">Status</th>
                        <th className="px-3 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredRequests.map((request) => (
                        <tr
                          key={request._id}
                          className="hover:bg-slate-50"
                        >
                          {/* Item */}
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-800">
                              {request.itemName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {request.category} · Qty {request.quantity}
                            </p>
                          </td>

                          {/* Employee */}
                          <td className="px-3 py-4 text-slate-600">
                            {getEmployeeName(request)}
                          </td>

                          {/* Amount */}
                          <td className="whitespace-nowrap px-3 py-4 font-semibold text-slate-800">
                            {formatCurrency(Number(request.amount) || 0)}
                          </td>

                          {/* Date */}
                          <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                            {formatDate(request.date || request.createdAt)}
                          </td>

                          {/* Current status */}
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                request.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : request.status === "rejected"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>

                          {/* Actions dropdown */}
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                aria-label={`Change status for ${request.itemName}`}
                                value={request.status}
                                disabled={actionId === request._id}
                                onChange={(event) => {
                                  const selectedStatus = event.target.value;

                                  if (
                                    selectedStatus === "approved" ||
                                    selectedStatus === "rejected"
                                  ) {
                                    void updateRequestStatus(
                                      request,
                                      selectedStatus
                                    );
                                  }
                                }}
                                className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#063d43] focus:ring-2 focus:ring-[#063d43]/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {request.status === "pending" && (
                                  <option value="pending" disabled>
                                    Pending
                                  </option>
                                )}

                                <option value="approved">
                                  Approve
                                </option>
                                <option value="rejected">
                                  Reject
                                </option>
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
            </div>

            {/* Recent notifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Recent Activity
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest notifications
                  </p>
                </div>

                <Activity size={20} className="text-slate-400" />
              </div>

              {loading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-slate-400"
                  />
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell
                    size={30}
                    className="mx-auto mb-3 text-slate-300"
                  />
                  <p className="text-sm text-slate-500">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div
                        className={`mt-0.5 rounded-lg p-2 ${
                          notification.isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-teal-50 text-teal-700"
                        }`}
                      >
                        <Bell size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                          )}
                        </div>

                        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-slate-400">
                            {formatDate(notification.createdAt)}
                          </span>

                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                void markNotificationRead(notification)
                              }
                              className="text-xs font-semibold text-teal-700 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total purchase value */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  Total purchase value
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {loading || requestsLoading
                    ? "—"
                    : formatCurrency(requestSummary.totalAmount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Includes all loaded requests
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row">
            <p>AccountFlow · Accounting &amp; Procurement Portal</p>
            <p>
              {currentDate
                ? `Last opened ${currentDate.toLocaleDateString("en-PK")}`
                : "Preparing dashboard..."}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
