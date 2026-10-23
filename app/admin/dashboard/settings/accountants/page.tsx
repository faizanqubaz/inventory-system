
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Users, UserCheck, Search } from "lucide-react";

import MyButton from "@/components/common/button";
import MyHeading from "@/components/common/heading";
import MyInput from "@/components/common/input";

interface Accountant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  status?: string;
  role?: string;
}

interface AccountantFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
}

export default function AccountantsPage() {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<AccountantFormData>({
    name: "",
    email: "",
    phone: "",
    department: "Finance",
  });

  const loadAccountants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/accountants", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load accountants.");
      }

      const list = result.accountants ?? result.data?.accountants ?? [];

      if (!Array.isArray(list)) {
        throw new Error("Invalid accountants response from the server.");
      }

      setAccountants(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load accountants."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccountants();
  }, [loadAccountants]);

  const activeAccountants = accountants.filter(
    (accountant) => accountant.status?.toLowerCase() === "active"
  ).length;

  const totalDepartments = new Set(
    accountants
      .map((accountant) => accountant.department?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const boxes = [
    {
      id: 1,
      title: "Total Accountants",
      count: accountants.length,
      desc: "All registered accountant accounts",
      icon: Users,
    },
    {
      id: 2,
      title: "Active Accountants",
      count: activeAccountants,
      desc: `${accountants.length - activeAccountants} inactive accounts`,
      icon: UserCheck,
    },
    {
      id: 3,
      title: "Departments",
      count: totalDepartments,
      desc: "Departments represented",
      icon: BriefcaseBusiness,
    },
  ];

  const filteredAccountants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return accountants;

    return accountants.filter((accountant) =>
      [
        accountant.name,
        accountant.email,
        accountant.phone,
        accountant.department,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [accountants, search]);

  const handleAddAccountant = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/accountants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add accountant.");
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        department: "Finance",
      });

      setShowForm(false);
      setSuccess(
        result.message || "Accountant created successfully."
      );

      await loadAccountants();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add accountant."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:ml-64 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              AccountFlow
              <span className="mx-2 text-gray-300">/</span>
              Administration
            </p>

            <MyHeading
              children="Accountants"
              headingcls="text-3xl font-bold tracking-tight text-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              Manage accountant accounts and finance access.
            </p>
          </div>

          <MyButton
            type="button"
            btncls="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
            handleClick={() => {
              setFormError("");
              setShowForm(true);
            }}
          >
            + Add Accountant
          </MyButton>
        </div>

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadAccountants()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boxes.map((box) => {
            const Icon = box.icon;

            return (
              <div
                key={box.id}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {box.title}
                  </p>
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                    <Icon size={21} />
                  </span>
                </div>

                <h2 className="my-3 text-3xl font-bold tracking-tight text-gray-900">
                  {loading ? "—" : box.count}
                </h2>

                <p className="text-xs text-gray-400">{box.desc}</p>
                <div className="mt-5 h-1 w-12 rounded-full bg-emerald-500 transition-all group-hover:w-20" />
              </div>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <MyHeading
                children="Accountants Directory"
                headingcls="text-lg font-bold text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                Accountant details and account status.
              </p>
            </div>

            <div className="w-full lg:max-w-sm">
              <MyInput
                name="search"
                value={search}
                handleChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(event.target.value)
                }
                inpcls="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Search accountants..."
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading accountants...
            </div>
          ) : !error && filteredAccountants.length === 0 ? (
            <div className="p-10 text-center">
              <BriefcaseBusiness
                size={32}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-semibold text-gray-700">
                No accountants found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add an accountant or try a different search.
              </p>
            </div>
          ) : (
            !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Phone</th>
                      <th className="px-6 py-4 font-semibold">Department</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredAccountants.map((accountant) => (
                      <tr
                        key={accountant._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {accountant.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {accountant.email}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {accountant.phone || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {accountant.department || "Finance"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              accountant.status?.toLowerCase() === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {accountant.status || "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {!loading && !error && search.trim() && (
            <div className="border-t border-gray-100 px-6 py-3 text-sm text-gray-500">
              Showing {filteredAccountants.length} matching accountants out
              of {accountants.length}.
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                Add Accountant
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the details to create an accountant account.
              </p>
            </div>

            <form onSubmit={handleAddAccountant} className="space-y-5 p-6">
              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="accountant@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  required
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                  placeholder="Finance"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Accountant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
