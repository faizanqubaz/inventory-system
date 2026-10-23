
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import AdminSidebar from "@/components/ui/AdminSidebar";


export default function AdminSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const settingsOptions = [
    {
      title: "Add Employee",
      description:
        "Create an employee account and manage employee information.",
      href: "/admin/dashboard/settings/employees",
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Add Accountant",
      description:
        "Create an accountant account for managing payments and expenses.",
      href: "/admin/dashboard/settings/accountants",
      icon: BriefcaseBusiness,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 px-3 py-2 lg:hidden"
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Settings size={22} className="text-[#063d43]" />
                <h1 className="text-2xl font-bold text-slate-900">
                  Settings
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Manage portal users and account types.
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              User Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the type of account you want to create.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {settingsOptions.map((option) => {
              const Icon = option.icon;

              return (
                <Link
                  key={option.title}
                  href={option.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#063d43]/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl p-3 ${option.color}`}>
                      <Icon size={25} />
                    </div>

                    <ArrowRight
                      size={20}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#063d43]"
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {option.title}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                    {option.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#063d43] px-4 py-2.5 text-sm font-semibold text-white">
                    <UserPlus size={16} />
                    Create Account
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
