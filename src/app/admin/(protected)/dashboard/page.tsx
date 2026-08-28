"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MetricsBarChart } from "../../../components/admin/MetricsBarChart";
import { Button } from "../../../components/ui/Button";
import { Toast } from "../../../components/ui/Toast";

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

const nextStatusMap: Record<AppointmentStatus, AppointmentStatus> = {
  pending: "confirmed",
  confirmed: "completed",
  completed: "completed",
  cancelled: "cancelled",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, AppointmentStatus>>(
    {}
  );

  async function loadDashboard() {
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load dashboard.");
      }

      setData(payload);
      setStatusDrafts(
        Object.fromEntries(
          payload.recentAppointments.map((item: DashboardData["recentAppointments"][number]) => [
            item.id,
            item.status,
          ])
        )
      );
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

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function updateStatus(id: number, status: AppointmentStatus) {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update appointment.");
      }

      setToast({ type: "success", message: "Appointment status updated." });
      await loadDashboard();
    } catch (updateError) {
      setToast({
        type: "error",
        message:
          updateError instanceof Error
            ? updateError.message
            : "Failed to update appointment.",
      });
    }
  }

  async function deleteAppointment(id: number) {
    if (!window.confirm("Delete this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete appointment.");
      }

      setToast({ type: "success", message: "Appointment deleted." });
      await loadDashboard();
    } catch (deleteError) {
      setToast({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete appointment.",
      });
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-purple-950">{card.value}</p>
            <p className="mt-2 text-sm text-purple-600">{card.detail}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 text-purple-700">
          Loading dashboard...
        </div>
      )}

      {error && (
        <div className="rounded-[1.8rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <MetricsBarChart
              title="Completed work by month"
              subtitle="Only completed appointments add money. Net includes tips minus expenses."
              data={data.revenueSeries}
              series={[
                { key: "completedCount", label: "Completed", colorClass: "bg-fuchsia-400" },
                { key: "netInCents", label: "Net money", colorClass: "bg-purple-600" },
              ]}
            />
            <MetricsBarChart
              title="Appointments by month"
              subtitle="Monthly totals with pending, completed, and cancelled status counts."
              data={data.statusSeries}
              series={[
                { key: "total", label: "Total", colorClass: "bg-slate-300" },
                { key: "pending", label: "Pending", colorClass: "bg-amber-400" },
                { key: "completed", label: "Completed", colorClass: "bg-emerald-500" },
                { key: "cancelled", label: "Cancelled", colorClass: "bg-rose-400" },
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
            <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
              <h2 className="text-2xl font-semibold text-purple-950">Monthly status view</h2>
              <p className="mt-2 text-sm text-purple-600">
                Completed means the work is done and the payment counts in your totals.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-purple-50 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">
                    Total appointments
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-purple-950">
                    {data.summary.monthlyTotalAppointments}
                  </div>
                </div>
                <div className="rounded-[1.4rem] bg-amber-50 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                    Pending
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-purple-950">
                    {data.summary.monthlyPendingAppointments}
                  </div>
                </div>
                <div className="rounded-[1.4rem] bg-emerald-50 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Completed
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-purple-950">
                    {data.summary.monthlyCompletedAppointments}
                  </div>
                </div>
                <div className="rounded-[1.4rem] bg-rose-50 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                    Cancelled
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-purple-950">
                    {data.summary.monthlyCancelledAppointments}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-purple-100 bg-white px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">
                    Expenses
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-purple-950">
                    {(data.summary.totalExpensesInCents / 100).toLocaleString()} ETB
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-purple-100 bg-white px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">
                    Tips
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-purple-950">
                    {(data.summary.totalTipsInCents / 100).toLocaleString()} ETB
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-purple-950">
                    Quick appointment change
                  </h2>
                  <p className="mt-2 text-sm text-purple-600">
                    Edit, delete, set status, or move to the next status quickly.
                  </p>
                </div>
                <Button href="/admin/appointments" variant="secondary">
                  Open full list
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {data.recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[1.4rem] border border-purple-100 bg-white px-4 py-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-semibold text-purple-950">
                            {appointment.name}
                          </div>
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-700">
                            {appointment.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-purple-600">
                          {appointment.serviceName} • {appointment.appointmentDate} • {appointment.appointmentTime}
                        </div>
                        <div className="text-sm text-purple-500">{appointment.email}</div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
                        <select
                          value={statusDrafts[appointment.id] ?? appointment.status}
                          onChange={(event) =>
                            setStatusDrafts((current) => ({
                              ...current,
                              [appointment.id]: event.target.value as AppointmentStatus,
                            }))
                          }
                          className="rounded-[1rem] border border-purple-200 bg-white px-3 py-2 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              statusDrafts[appointment.id] ?? appointment.status
                            )
                          }
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              nextStatusMap[statusDrafts[appointment.id] ?? appointment.status]
                            )
                          }
                        >
                          Next Status
                        </Button>
                        <Link
                          href="/admin/appointments"
                          className="inline-flex items-center justify-center rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-900"
                        >
                          Edit
                        </Link>
                        <Button type="button" onClick={() => deleteAppointment(appointment.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
