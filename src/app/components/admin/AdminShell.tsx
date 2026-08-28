"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { LogoutButton } from "../auth/LogoutButton";

type AdminShellProps = {
  children: ReactNode;
  session: {
    name: string;
    email: string;
  };
};

const mainNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/admin/appointments", icon: ClipboardList },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Expenses", href: "/admin/expenses", icon: CreditCard },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

const systemNavItems = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children, session }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="flex flex-col bg-[#e7d9fb] px-4 py-6 lg:h-screen lg:sticky lg:top-0">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-700 via-fuchsia-600 to-purple-400 text-base font-bold text-white shadow-[0_12px_20px_rgba(118,66,183,0.24)]">
            F
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-950">Flora Admin</div>
            <div className="text-xs text-purple-500">Dashboard</div>
          </div>
        </Link>

        <div className="mt-8">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-purple-500">
            Main
          </div>
          <nav className="mt-2 space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-medium text-white"
                      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-purple-900 transition hover:bg-white/60 hover:text-purple-950"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-purple-500">
            System
          </div>
          <nav className="mt-2 space-y-0.5">
            {systemNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-medium text-white"
                      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-purple-900 transition hover:bg-white/60 hover:text-purple-950"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6">
          <LogoutButton redirectTo="/admin/login" label="Log out" variant="secondary" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm font-medium text-slate-500">Welcome back</p>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <CircleUserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-right">
              <div className="truncate text-sm font-semibold text-slate-900">
                {session.name}
              </div>
              <div className="truncate text-xs text-slate-500">{session.email}</div>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-6">{children}</main>
      </div>
    </div>
  );
}
