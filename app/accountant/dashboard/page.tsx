
"use client";

import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Wallet,
  ShoppingCart,
  ChartNoAxesCombined,
  Download,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  TrendingUp,
  Eye,
  Check,
  Plus,
  CalendarDays,
  FileSpreadsheet,
  ReceiptText,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

type RequestStatus = "Paid" | "Unpaid";

interface PurchaseRequest {
  id: string;
  employee: string;
  department: string;
  item: string;
  amount: number;
  date: string;
  status: RequestStatus;
}

interface DirectPurchase {
  id: string;
  item: string;
  category: string;
  amount: number;
  date: string;
  paymentStatus: RequestStatus;
  description: string;
}

const initialRequests: PurchaseRequest[] = [
  {
    id: "PR-1024",
    employee: "Ali Ahmed",
    department: "IT",
    item: "Office supplies",
    amount: 12500,
    date: "2026-10-22",
    status: "Unpaid",
  },
  {
    id: "PR-1023",
    employee: "Sara Khan",
    department: "HR",
    item: "Travel expenses",
    amount: 8000,
    date: "2026-10-21",
    status: "Paid",
  },
  {
    id: "PR-1022",
    employee: "Usman Ali",
    department: "IT",
    item: "Computer accessories",
    amount: 24000,
    date: "2026-10-20",
    status: "Unpaid",
  },
  {
    id: "PR-1021",
    employee: "Ayesha Noor",
    department: "Finance",
    item: "Printer maintenance",
    amount: 6500,
    date: "2026-10-19",
    status: "Paid",
  },
  {
    id: "PR-1020",
    employee: "Hamza Khan",
    department: "Procurement",
    item: "Stationery",
    amount: 4500,
    date: "2026-10-18",
    status: "Unpaid",
  },
];

const initialDirectPurchases: DirectPurchase[] = [
  {
    id: "DP-001",
    item: "Office refreshments",
    category: "Food",
    amount: 3500,
    date: "2026-10-22",
    paymentStatus: "Paid",
    description: "Refreshments for the office",
  },
  {
    id: "DP-002",
    item: "Emergency stationery",
    category: "Office Supplies",
    amount: 2200,
    date: "2026-10-21",
    paymentStatus: "Unpaid",
    description: "Direct office purchase",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Approved Requests", icon: ClipboardCheck },
  { label: "Payment Portal", icon: Wallet },
  { label: "Direct Purchases", icon: ShoppingCart },
  { label: "Financial Reports", icon: ChartNoAxesCombined },
  { label: "Exports", icon: Download },
];

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        status === "Paid"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {status === "Paid" ? (
        <CheckCircle2 size={13} />
      ) : (
        <Clock3 size={13} />
      )}
      {status}
    </span>
  );
}

export default function AccountantDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [requests, setRequests] =
    useState<PurchaseRequest[]>(initialRequests);
  const [directPurchases, setDirectPurchases] =
    useState<DirectPurchase[]>(initialDirectPurchases);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showDetails, setShowDetails] =
    useState<PurchaseRequest | null>(null);
  const [notice, setNotice] = useState("");

const [purchaseForm, setPurchaseForm] = useState({
  item: "",
  category: "Office Supplies",
  amount: "",
  date: "",
  description: "",
  paymentStatus: "Unpaid" as RequestStatus,
});

  const paidRequests = requests.filter((r) => r.status === "Paid");
  const unpaidRequests = requests.filter((r) => r.status === "Unpaid");

  const totalPaid =
    paidRequests.reduce((sum, r) => sum + r.amount, 0) +
    directPurchases
      .filter((p) => p.paymentStatus === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid =
    unpaidRequests.reduce((sum, r) => sum + r.amount, 0) +
    directPurchases
      .filter((p) => p.paymentStatus === "Unpaid")
      .reduce((sum, p) => sum + p.amount, 0);

  const totalSpending =
    requests.reduce((sum, r) => sum + r.amount, 0) +
    directPurchases.reduce((sum, p) => sum + p.amount, 0);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = [
        request.id,
        request.employee,
        request.department,
        request.item,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        paymentFilter === "All" || request.status === paymentFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, paymentFilter]);

  function togglePayment(id: string) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: request.status === "Paid" ? "Unpaid" : "Paid",
            }
          : request
      )
    );

    setNotice("Payment status updated in this demo.");
    window.setTimeout(() => setNotice(""), 2500);
  }

  function toggleDirectPurchasePayment(id: string) {
    setDirectPurchases((current) =>
      current.map((purchase) =>
        purchase.id === id
          ? {
              ...purchase,
              paymentStatus:
                purchase.paymentStatus === "Paid" ? "Unpaid" : "Paid",
            }
          : purchase
      )
    );
  }

  function addDirectPurchase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(purchaseForm.amount);

    if (
      !purchaseForm.item.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setNotice("Enter an item name and a valid amount.");
      return;
    }

    const newPurchase: DirectPurchase = {
      id: `DP-${String(Date.now()).slice(-6)}`,
      item: purchaseForm.item.trim(),
      category: purchaseForm.category,
      amount,
      date: purchaseForm.date,
      paymentStatus: purchaseForm.paymentStatus,
      description: purchaseForm.description.trim(),
    };

    setDirectPurchases((current) => [newPurchase, ...current]);
    setPurchaseForm({
      item: "",
      category: "Office Supplies",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
      paymentStatus: "Unpaid",
    });
    setShowPurchaseForm(false);
    setActivePage("Direct Purchases");
    setNotice("Direct purchase added in this demo.");
    window.setTimeout(() => setNotice(""), 2500);
  }

  function exportCSV() {
    const header = [
      "Reference",
      "Type",
      "Item",
      "Employee",
      "Department",
      "Date",
      "Amount PKR",
      "Payment Status",
    ];

    const rows = [
      ...requests.map((r) => [
        r.id,
        "Approved Request",
        r.item,
        r.employee,
        r.department,
        r.date,
        r.amount,
        r.status,
      ]),
      ...directPurchases.map((p) => [
        p.id,
        "Direct Purchase",
        p.item,
        "",
        p.category,
        p.date,
        p.amount,
        p.paymentStatus,
      ]),
    ];

    const csvCell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `accountflow-financial-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function navigate(label: string) {
    setActivePage(label);
    setSidebarOpen(false);
    setSearch("");
    setPaymentFilter("All");
  }

  const pageDescription: Record<string, string> = {
    Dashboard: "Your financial activity and payment overview.",
    "Approved Requests": "Review approved requests awaiting payment.",
    "Payment Portal": "Track payments and update their status.",
    "Direct Purchases": "Record purchases made directly by employees or the office.",
    "Financial Reports": "Review total spending and payment summaries.",
    Exports: "Download financial records for reporting and reconciliation.",
    Settings: "Account and portal preferences.",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#063d43] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <ReceiptText size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">AccountFlow</h1>
              <p className="text-xs text-teal-100/70">Accountant Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-3 pt-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-100/50">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => {
              const active = activePage === label;

              return (
                <button
                  key={label}
                  onClick={() => navigate(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    active
                      ? "bg-white text-[#063d43] shadow-sm"
                      : "text-teal-50/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  <span className="flex-1 font-medium">{label}</span>
                  {label === "Approved Requests" && unpaidRequests.length > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-teal-50 text-[#063d43]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {unpaidRequests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-[#063d43]">
                AC
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Accountant</p>
                <p className="text-xs text-teal-100/60">Finance Department</p>
              </div>
            </div>
            <button
              onClick={() => navigate("Settings")}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-teal-50/80 hover:bg-white/10"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                AccountFlow / Accountant
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-slate-800">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">
                Accountant
              </p>
              <p className="text-xs text-slate-400">Finance</p>
            </div>
            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <Bell size={19} />
              {unpaidRequests.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-[#063d43]">
              AC
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          {notice && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              <CheckCircle2 size={18} />
              {notice}
            </div>
          )}

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {activePage === "Dashboard"
                  ? "Financial overview"
                  : activePage}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {pageDescription[activePage]}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowPurchaseForm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Plus size={17} />
                Direct purchase
              </button>
              <button
                onClick={exportCSV}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063d43] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08545b]"
              >
                <Download size={17} />
                Export report
              </button>
            </div>
          </div>

          {(activePage === "Dashboard" ||
            activePage === "Financial Reports" ||
            activePage === "Exports") && (
            <>
              <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Approved requests"
                  value={String(requests.length)}
                  detail="Available for processing"
                  icon={ClipboardCheck}
                  iconClass="bg-blue-50 text-blue-700"
                  trend="Request queue"
                />
                <StatCard
                  title="Total paid"
                  value={formatPKR(totalPaid)}
                  detail={`${paidRequests.length} paid requests`}
                  icon={CheckCircle2}
                  iconClass="bg-emerald-50 text-emerald-700"
                  trend="Payment completed"
                />
                <StatCard
                  title="Total unpaid"
                  value={formatPKR(totalUnpaid)}
                  detail={`${unpaidRequests.length} unpaid requests`}
                  icon={Clock3}
                  iconClass="bg-amber-50 text-amber-700"
                  trend="Needs attention"
                />
                <StatCard
                  title="Total spending"
                  value={formatPKR(totalSpending)}
                  detail="Requests + direct purchases"
                  icon={CircleDollarSign}
                  iconClass="bg-violet-50 text-violet-700"
                  trend="All recorded expenses"
                />
              </div>

              <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        Payment overview
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Distribution of recorded expenses
                      </p>
                    </div>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                      All records
                    </span>
                  </div>

                  <div className="mb-5 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Paid</span>
                    <span className="font-semibold text-slate-800">
                      {formatPKR(totalPaid)}
                    </span>
                  </div>
                  <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${
                          totalSpending
                            ? (totalPaid / totalSpending) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="mb-5 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Unpaid</span>
                    <span className="font-semibold text-slate-800">
                      {formatPKR(totalUnpaid)}
                    </span>
                  </div>
                  <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{
                        width: `${
                          totalSpending
                            ? (totalUnpaid / totalSpending) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                    <div className="rounded-xl bg-emerald-50/70 p-4">
                      <p className="text-xs text-emerald-700">Paid percentage</p>
                      <p className="mt-1 text-xl font-bold text-emerald-800">
                        {totalSpending
                          ? `${Math.round((totalPaid / totalSpending) * 100)}%`
                          : "0%"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50/70 p-4">
                      <p className="text-xs text-amber-700">
                        Outstanding percentage
                      </p>
                      <p className="mt-1 text-xl font-bold text-amber-800">
                        {totalSpending
                          ? `${Math.round((totalUnpaid / totalSpending) * 100)}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-teal-50 p-3 text-[#063d43]">
                      <TrendingUp size={21} />
                    </div>
                    <div>
                      <h3 className="font-bold">Quick actions</h3>
                      <p className="text-xs text-slate-500">
                        Common finance tasks
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <QuickAction
                      icon={ClipboardCheck}
                      title="Process approved requests"
                      description={`${unpaidRequests.length} currently unpaid`}
                      onClick={() => navigate("Approved Requests")}
                    />
                    <QuickAction
                      icon={Wallet}
                      title="Manage payments"
                      description="Update paid or unpaid status"
                      onClick={() => navigate("Payment Portal")}
                    />
                    <QuickAction
                      icon={ShoppingCart}
                      title="Record a purchase"
                      description="Add a direct expense"
                      onClick={() => setShowPurchaseForm(true)}
                    />
                    <QuickAction
                      icon={FileSpreadsheet}
                      title="Financial reports"
                      description="Download CSV records"
                      onClick={() => navigate("Exports")}
                    />
                  </div>
                </section>
              </div>
            </>
          )}

          {(activePage === "Dashboard" ||
            activePage === "Approved Requests" ||
            activePage === "Payment Portal") && (
            <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {activePage === "Payment Portal"
                      ? "Payment management"
                      : "Approved request queue"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Mark requests as paid after payment has been completed.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search requests..."
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:w-56"
                    />
                  </div>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="All">All statuses</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Request</th>
                      <th className="px-6 py-4 font-semibold">Employee</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {request.item}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {request.id} · {request.department}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{request.employee}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {request.department}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {request.date}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {formatPKR(request.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                title="View request"
                                onClick={() => setShowDetails(request)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => togglePayment(request.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                  request.status === "Paid"
                                    ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                    : "bg-[#063d43] text-white hover:bg-[#08545b]"
                                }`}
                              >
                                {request.status === "Paid" ? (
                                  <>
                                    <Clock3 size={14} /> Mark unpaid
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} /> Mark paid
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No matching requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredRequests.length} of {requests.length} requests
                </span>
                <span>
                  Unpaid requests: {unpaidRequests.length}
                </span>
              </div>
            </section>
          )}

          {(activePage === "Dashboard" ||
            activePage === "Direct Purchases") && (
            <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Direct purchases
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Expenses recorded outside the normal request approval flow.
                  </p>
                </div>
                <button
                  onClick={() => setShowPurchaseForm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-[#063d43] hover:bg-teal-100"
                >
                  <Plus size={17} />
                  Add purchase
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Purchase</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {directPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{purchase.item}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {purchase.id}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {purchase.category}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {purchase.date}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {formatPKR(purchase.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={purchase.paymentStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              toggleDirectPurchasePayment(purchase.id)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                          >
                            Mark{" "}
                            {purchase.paymentStatus === "Paid"
                              ? "unpaid"
                              : "paid"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {directPurchases.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          No direct purchases have been added.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "Financial Reports" && (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold">Financial summary</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Totals from the current sample records.
                </p>
                <div className="mt-6 space-y-4">
                  <ReportLine label="Approved requests" value={formatPKR(requests.reduce((s, r) => s + r.amount, 0))} />
                  <ReportLine label="Direct purchases" value={formatPKR(directPurchases.reduce((s, p) => s + p.amount, 0))} />
                  <ReportLine label="Paid" value={formatPKR(totalPaid)} />
                  <ReportLine label="Unpaid" value={formatPKR(totalUnpaid)} />
                  <div className="border-t border-slate-100 pt-4">
                    <ReportLine label="Total expenses" value={formatPKR(totalSpending)} strong />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-50 p-3 text-[#063d43]">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold">Export financial data</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Download your current records as a CSV file.
                    </p>
                  </div>
                </div>
                <button
                  onClick={exportCSV}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#063d43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#08545b]"
                >
                  <Download size={17} />
                  Download CSV report
                </button>
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  You can open the downloaded CSV in Excel or import it into a
                  spreadsheet application.
                </p>
              </div>
            </section>
          )}

          {activePage === "Exports" && (
            <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-teal-50 p-3 text-[#063d43]">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Export financial records</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Export approved requests and direct purchases with their
                    amounts, dates, departments, and payment statuses.
                  </p>
                  <button
                    onClick={exportCSV}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#063d43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#08545b]"
                  >
                    <Download size={17} />
                    Export CSV
                  </button>
                </div>
              </div>
            </section>
          )}

          {activePage === "Settings" && (
            <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold">Accountant settings</h3>
              <p className="mt-2 text-sm text-slate-500">
                Account preferences and security options can be connected here.
              </p>
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Signed in as Accountant · Finance Department
              </div>
            </section>
          )}
        </main>
      </div>

      {showPurchaseForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold">Add direct purchase</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Record an expense made directly.
                </p>
              </div>
              <button
                onClick={() => setShowPurchaseForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addDirectPurchase} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Item or purchase name *
                </label>
                <input
                  required
                  value={purchaseForm.item}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, item: e.target.value })
                  }
                  placeholder="e.g. Office supplies"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category *
                  </label>
                  <select
                    value={purchaseForm.category}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600"
                  >
                    <option>Office Supplies</option>
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Petty Cash</option>
                    <option>Maintenance</option>
                    <option>Utilities</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount (PKR) *
                  </label>
                  <input
                    required
                    min="1"
                    type="number"
                    value={purchaseForm.amount}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Purchase date *
                  </label>
                  <input
                    required
                    type="date"
                    value={purchaseForm.date}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Payment status
                  </label>
                  <select
                    value={purchaseForm.paymentStatus}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        paymentStatus: e.target.value as RequestStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={purchaseForm.description}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Additional purchase details..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowPurchaseForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063d43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#08545b]"
                >
                  <Plus size={17} />
                  Save purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Request details
                </p>
                <h3 className="mt-1 text-xl font-bold">{showDetails.item}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {showDetails.id}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(null)}
                aria-label="Close request details"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4">
              <ReportLine label="Employee" value={showDetails.employee} />
              <ReportLine label="Department" value={showDetails.department} />
              <ReportLine label="Date" value={showDetails.date} />
              <ReportLine label="Amount" value={formatPKR(showDetails.amount)} />
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">Payment status</span>
                <StatusBadge status={showDetails.status} />
              </div>
            </div>

            <button
              onClick={() => {
                togglePayment(showDetails.id);
                setShowDetails(null);
              }}
              className="mt-6 w-full rounded-xl bg-[#063d43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#08545b]"
            >
              Mark {showDetails.status === "Paid" ? "unpaid" : "paid"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  iconClass,
  trend,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  iconClass: string;
  trend: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
      <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <ArrowUpRight size={14} />
        {trend}
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-teal-100 hover:bg-teal-50/50"
    >
      <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600 transition group-hover:bg-teal-100 group-hover:text-[#063d43]">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <ArrowUpRight
        size={16}
        className="text-slate-300 transition group-hover:text-[#063d43]"
      />
    </button>
  );
}

function ReportLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-800" : "text-sm text-slate-500"}>
        {label}
      </span>
      <span className={strong ? "text-lg font-bold text-[#063d43]" : "text-sm font-semibold text-slate-800"}>
        {value}
      </span>
    </div>
  );
}
