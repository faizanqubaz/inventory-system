
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CheckCircle,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Users,
  X,
  Settings
} from "lucide-react";


interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  unreadNotifications?: number;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pending Requests",
    href: "/admin/dashboard/requests/pending",
    icon: ClipboardList,
  },
  {
    label: "Approved Requests",
    href: "/admin/dashboard/requests/approved",
    icon: CheckCircle,
  },
  {
    label: "Rejected Requests",
    href: "/admin/dashboard/requests/rejected",
    icon: X,
  },
  {
    label: "Purchasing Details",
    href: "/admin/dashboard/purchasing-details",
    icon: ShoppingCart,
  },
  {
    label: "Employee Directory",
    href: "/admin/dashboard/employees",
    icon: Users,
  },
  {
    label: "Notifications",
    href: "/admin/dashboard/notifications",
    icon: Bell,
  },
  {
  label: "Settings",
  href: "/admin/dashboard/settings",
  icon: Settings,
},
];

export default function AdminSidebar({
  isOpen = false,
  onClose,
  unreadNotifications = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#063d43] text-white transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-xl font-bold">AccountFlow</h1>
            <p className="mt-1 text-xs text-white/60">
              Accounting &amp; Procurement
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-white/15 font-semibold text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.label === "Notifications" &&
                  unreadNotifications > 0 && (
                    <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900">
                      {unreadNotifications}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/admin/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
