"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  Wallet,
  X,
  Eye,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";

type PaymentStatus = "Paid" | "Unpaid";
type PaymentFilter = "All" | "Paid" | "Unpaid";

interface PurchaseRequest {
  id: string;
  employee: string;
  department: string;
  item: string;
  category: string;
  quantity: number;
  amount: number;
  date: string;
  description: string;
  receipt: string;
  status: PaymentStatus;
}

interface ApiPurchaseRequest {
  id?: string;
  _id?: string;
  employee?: string;
  department?: string;
  item?: string;
  category?: string;
  quantity?: number;
  amount?: number;
  date?: string;
  description?: string;
  receipt?: string;
  paymentStatus?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  requests?: ApiPurchaseRequest[];
}

const navigation = [
  {
    label: "Dashboard",
    href: "/accountant/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Payment Requests",
    href: "/accountant/dashboard",
    icon: CreditCard,
  },
  {
    label: "Employees",
    href: "/accountant/employees",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/accountant/settings",
    icon: Settings,
  },
];

export default function AccountantDashboard() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PaymentFilter>("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<PurchaseRequest | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/accountant/purchase-requests", {
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to fetch approved purchase requests."
        );
      }

      const mappedRequests: PurchaseRequest[] = (
        result.requests ?? []
      ).map((request) => ({
        id: request._id ?? request.id ?? "",
        employee: request.employee ?? "Unknown employee",
        department: request.department ?? "N/A",
        item: request.item ?? "Unnamed item",
        category: request.category ?? "Other",
        quantity: Number(request.quantity ?? 1),
        amount: Number(request.amount ?? 0),
        date: request.date ?? "",
        description: request.description ?? "",
        receipt: request.receipt ?? "",
        status:
          request.paymentStatus?.toLowerCase() === "paid"
            ? "Paid"
            : "Unpaid",
      }));

      setRequests(mappedRequests);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const paidRequests = useMemo(
    () => requests.filter((request) => request.status === "Paid"),
    [requests]
  );

  const unpaidRequests = useMemo(
    () => requests.filter((request) => request.status === "Unpaid"),
    [requests]
  );

  const totalAmount = useMemo(
    () => requests.reduce((sum, request) => sum + request.amount, 0),
    [requests]
  );

  const paidAmount = useMemo(
    () => paidRequests.reduce((sum, request) => sum + request.amount, 0),
    [paidRequests]
  );

  const unpaidAmount = useMemo(
    () => unpaidRequests.reduce((sum, request) => sum + request.amount, 0),
    [unpaidRequests]
  );

  const filteredRequests = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        request.item.toLowerCase().includes(searchValue) ||
        request.employee.toLowerCase().includes(searchValue) ||
        request.department.toLowerCase().includes(searchValue) ||
        request.category.toLowerCase().includes(searchValue) ||
        request.id.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" || request.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter]);

  const togglePayment = async (id: string) => {
    const currentRequest = requests.find((request) => request.id === id);

    if (!currentRequest || updatingId !== null) return;

    const nextStatus =
      currentRequest.status === "Paid" ? "unpaid" : "paid";

    try {
      setUpdatingId(id);
      setError("");
      setNotice("");

      const response = await fetch(
        `/api/accountant/purchase-requests/${id}/payment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: nextStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update payment.");
      }

      const updatedStatus: PaymentStatus =
        nextStatus === "paid" ? "Paid" : "Unpaid";

      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? { ...request, status: updatedStatus }
            : request
        )
      );

      setSelectedRequest((current) =>
        current?.id === id
          ? { ...current, status: updatedStatus }
          : current
      );

      setNotice(
        `Payment for "${currentRequest.item}" marked ${nextStatus}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update payment."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <Wallet size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                AccountFlow
              </h2>
              <p className="text-xs text-slate-500">
                Accounting & Procurement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Accountant profile */}
        <div className="mx-4 mt-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
              AC
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Accountant
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Finance Department
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-teal-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Accountant portal
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0 || index === 1;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-700 text-white shadow-md shadow-teal-900/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />
                <span className="flex-1">{item.label}</span>

                {index === 1 && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {unpaidRequests.length}
                  </span>
                )}

                {isActive && <ChevronRight size={16} />}
              </a>
            );
          })}

          <div className="mt-8 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard size={18} />
              <p className="text-sm font-semibold">Payment overview</p>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Track approved expenses and keep payment records up to date.
            </p>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Unpaid requests</span>
              <span className="font-bold text-amber-700">
                {unpaidRequests.length}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-600 transition-all"
                style={{
                  width:
                    requests.length > 0
                      ? `${(paidRequests.length / requests.length) * 100}%`
                      : "0%",
                }}
              />
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              {requests.length > 0
                ? `${Math.round(
                    (paidRequests.length / requests.length) * 100
                  )}% of requests paid`
                : "No approved requests yet"}
            </p>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-4">
          <a
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={19} />
            Back to Login
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs text-slate-500">
                AccountFlow / Workspace
              </p>
              <h1 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                Accountant Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Finance Team
              </p>
              <p className="text-xs text-slate-500">Accountant</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800 ring-2 ring-white">
              AC
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-8">
          {/* Heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Overview
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Monitor approved purchase requests and manage their payments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchRequests()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh data
            </button>
          </div>

          {/* Alerts */}
          {notice && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p className="flex-1">{notice}</p>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void fetchRequests()}
                disabled={loading}
                className="inline-flex items-center gap-2 font-semibold underline disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          )}

          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Approved Requests"
              value={String(requests.length)}
              description="Approved requests in the payment queue"
              icon={<FileText size={21} />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Total Approved Amount"
              value={formatCurrency(totalAmount)}
              description="Combined amount of approved requests"
              icon={<Wallet size={21} />}
              iconClass="bg-violet-50 text-violet-700"
            />

            <SummaryCard
              title="Paid Amount"
              value={formatCurrency(paidAmount)}
              description={`${paidRequests.length} paid request(s)`}
              icon={<CheckCircle2 size={21} />}
              iconClass="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Unpaid Amount"
              value={formatCurrency(unpaidAmount)}
              description={`${unpaidRequests.length} unpaid request(s)`}
              icon={<Clock3 size={21} />}
              iconClass="bg-amber-50 text-amber-700"
            />
          </section>

          {/* Requests table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Approved Purchase Requests
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Search requests and update their payment status.
                  </p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search item, employee, department..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {(["All", "Unpaid", "Paid"] as PaymentFilter[]).map(
                  (option) => {
                    const count =
                      option === "All"
                        ? requests.length
                        : option === "Paid"
                          ? paidRequests.length
                          : unpaidRequests.length;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFilter(option)}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          filter === option
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {option}
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-xs ${
                            filter === option
                              ? "bg-white/20 text-white"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  }
                )}

                <span className="ml-auto text-xs text-slate-500">
                  {filteredRequests.length} result(s)
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2
                  size={28}
                  className="animate-spin text-teal-700"
                />
                <p className="text-sm">Loading approved requests...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Employee / Item
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Department
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Payment Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                              <Banknote size={19} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {request.item}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {request.employee}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {request.category} · Qty: {request.quantity}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            {request.department}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(request.date)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-800">
                          {formatCurrency(request.amount)}
                        </td>

                        <td className="px-6 py-4">
                          <PaymentBadge status={request.status} />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(request)}
                              title="View request details"
                              aria-label={`View ${request.item} details`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => void togglePayment(request.id)}
                              disabled={updatingId !== null}
                              className={`inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                                request.status === "Paid"
                                  ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                  : "bg-teal-700 text-white hover:bg-teal-800"
                              }`}
                            >
                              {updatingId === request.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : request.status === "Paid" ? (
                                <Clock3 size={14} />
                              ) : (
                                <CreditCard size={14} />
                              )}

                              {updatingId === request.id
                                ? "Saving..."
                                : request.status === "Paid"
                                  ? "Mark Unpaid"
                                  : "Mark Paid"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <FileText size={25} />
                          </div>
                          <h4 className="mt-4 font-semibold text-slate-800">
                            No purchase requests found
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">
                            {requests.length === 0
                              ? "Approved purchase requests will appear here."
                              : "Try changing your search or payment filter."}
                          </p>

                          {(search || filter !== "All") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setFilter("All");
                              }}
                              className="mt-4 text-sm font-semibold text-teal-700 hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && requests.length > 0 && (
              <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm sm:flex-row sm:items-center">
                <p className="text-slate-500">
                  Showing {filteredRequests.length} of {requests.length} approved requests
                </p>
                <p className="font-semibold text-slate-700">
                  Unpaid balance: {formatCurrency(unpaidAmount)}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Request details modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-details-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-teal-700">
                  Purchase Request Details
                </p>
                <h2
                  id="request-details-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  {selectedRequest.item}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Request amount</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCurrency(selectedRequest.amount)}
                </p>
              </div>
              <PaymentBadge status={selectedRequest.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <DetailItem label="Employee" value={selectedRequest.employee} />
              <DetailItem label="Department" value={selectedRequest.department} />
              <DetailItem label="Category" value={selectedRequest.category} />
              <DetailItem label="Quantity" value={String(selectedRequest.quantity)} />
              <DetailItem label="Request Date" value={formatDate(selectedRequest.date)} />
              <DetailItem label="Request ID" value={selectedRequest.id} />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {selectedRequest.description || "No description provided."}
              </p>
            </div>

            {selectedRequest.receipt && (
              <a
                href={selectedRequest.receipt}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
              >
                <FileText size={17} />
                View receipt
              </a>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => void togglePayment(selectedRequest.id)}
                disabled={updatingId !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {updatingId === selectedRequest.id && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {selectedRequest.status === "Paid"
                  ? "Mark Unpaid"
                  : "Mark Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const isPaid = status === "Paid";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
        isPaid
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
      }`}
    >
      {isPaid ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
      {status}
    </span>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
