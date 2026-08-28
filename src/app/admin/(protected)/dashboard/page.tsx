"use client";

import { useEffect, useMemo, useState } from "react";
import { MetricsBarChart } from "../../../components/admin/MetricsBarChart";
import { StatusPieChart } from "../../../components/admin/StatusPieChart";

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

type DashboardData = {
  summary: {
    totalNetInCents: number;
    totalRevenueInCents: number;
    totalCompletedAppointments: number;
    todayNetInCents: number;
    todayCompletedAppointments: number;
    weeklyNetInCents: number;
    weeklyCompletedAppointments: number;
    monthlyNetInCents: number;
    monthlyCompletedAppointments: number;
    monthlyTotalAppointments: number;
    monthlyPendingAppointments: number;
    monthlyConfirmedAppointments: number;
    monthlyCancelledAppointments: number;
    totalExpensesInCents: number;
    totalTipsInCents: number;
  };
  revenueSeries: Array<{
    label: string;
    netInCents: number;
    revenueInCents: number;
    completedCount: number;
  }>;
  statusSeries: Array<{
    label: string;
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }>;
  recentAppointments: Array<{
    id: number;
    name: string;
    email: string;
    appointmentDate: string;
    appointmentTime: string;
    status: AppointmentStatus;
    priceAtBooking: number;
    serviceId: number;
    serviceName: string | null;
  }>;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load dashboard.");
      }

      setData(payload);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Total money",
        value: `${(data.summary.totalNetInCents / 100).toLocaleString()} ETB`,
        detail: `${data.summary.totalCompletedAppointments} completed appointments`,
      },
      {
        label: "Daily work",
        value: `${(data.summary.todayNetInCents / 100).toLocaleString()} ETB`,
        detail: `${data.summary.todayCompletedAppointments} completed today`,
      },
      {
        label: "Weekly work",
        value: `${(data.summary.weeklyNetInCents / 100).toLocaleString()} ETB`,
        detail: `${data.summary.weeklyCompletedAppointments} completed this week`,
      },
      {
        label: "Monthly work",
        value: `${(data.summary.monthlyNetInCents / 100).toLocaleString()} ETB`,
        detail: `${data.summary.monthlyCompletedAppointments} completed this month`,
      },
    ];
  }, [data]);

  const monthlyStatusSlices = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Pending",
        value: data.summary.monthlyPendingAppointments,
        color: "#ff2f7d",
        toneClass: "text-pink-600",
      },
      {
        label: "Confirmed",
        value: data.summary.monthlyConfirmedAppointments,
        color: "#4a90e2",
        toneClass: "text-blue-600",
      },
      {
        label: "Completed",
        value: data.summary.monthlyCompletedAppointments,
        color: "#ffd24a",
        toneClass: "text-amber-600",
      },
      {
        label: "Cancelled",
        value: data.summary.monthlyCancelledAppointments,
        color: "#4b4b4b",
        toneClass: "text-slate-700",
      },
    ];
  }, [data]);

  const completedWorkSeries = useMemo(() => {
    if (!data) {
      return [];
    }

    const cancelledByLabel = new Map(
      data.statusSeries.map((item) => [item.label, item.cancelled])
    );

    return data.revenueSeries.map((item) => ({
      label: item.label,
      completedCount: item.completedCount,
      netInCents: item.netInCents,
      cancelled: cancelledByLabel.get(item.label) ?? 0,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
          Loading dashboard...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
      )}

      {data && (
        <>
          <div>
            <MetricsBarChart
              title="Completed work by month"
              subtitle="Showing only completed work, net money, and cancelled appointments by month."
              data={completedWorkSeries}
              series={[
                { key: "completedCount", label: "Completed", colorClass: "bg-fuchsia-400" },
                { key: "netInCents", label: "Net money", colorClass: "bg-purple-600" },
                { key: "cancelled", label: "Cancelled", colorClass: "bg-rose-400" },
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Expenses and tips</h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-lg bg-rose-50 px-5 py-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                    Expenses
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-slate-900">
                    {(data.summary.totalExpensesInCents / 100).toLocaleString()} ETB
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 px-5 py-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Tips
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-slate-900">
                    {(data.summary.totalTipsInCents / 100).toLocaleString()} ETB
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Monthly status view</h2>
              <p className="mt-2 text-sm text-slate-500">
                Completed means the work is done and the payment counts in your totals.
              </p>

              <div className="mt-6">
                <StatusPieChart
                  total={data.summary.monthlyTotalAppointments}
                  slices={monthlyStatusSlices}
                  variant="doughnut"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
