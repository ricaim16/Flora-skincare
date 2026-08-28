import Link from "next/link";
import { redirect } from "next/navigation";
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
import { LogoutButton } from "../../components/auth/LogoutButton";
import { getCurrentSession } from "../../../lib/auth";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Report", href: "/admin/reports", icon: FileText },
  { label: "Service", href: "/admin/services", icon: Sparkles },
  { label: "Change Password", href: "/admin/settings", icon: Settings },
  { label: "Customer", href: "/admin/customers", icon: Users },
  { label: "Appointment", href: "/admin/appointments", icon: ClipboardList },
  { label: "Expense", href: "/admin/expenses", icon: CreditCard },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,173,255,0.55),_transparent_28%),linear-gradient(180deg,_#fff9fd_0%,_#f9f2ff_40%,_#f2e8ff_100%)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_54px_rgba(59,22,95,0.08)] backdrop-blur-xl">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-purple-400 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-950">Flora Admin</div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">
                Manager Side
              </div>
            </div>
          </Link>

          <div className="mt-6 rounded-[1.6rem] border border-purple-100 bg-purple-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-purple-700 shadow-sm">
                <CircleUserRound className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-purple-950">
                  {session.name}
                </div>
                <div className="truncate text-sm text-purple-600">{session.email}</div>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm font-semibold text-purple-900 transition hover:bg-purple-50"
                >
                  <Icon className="h-4 w-4 text-purple-600" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">
            <LogoutButton redirectTo="/admin/login" label="Logout" />
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
