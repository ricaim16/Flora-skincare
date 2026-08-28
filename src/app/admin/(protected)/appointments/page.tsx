"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../../../components/admin/Pagination";
import { Button } from "../../../components/ui/Button";
import { Toast } from "../../../components/ui/Toast";

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

type Service = {
  id: number;
  name: string;
};

type Appointment = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  serviceId: number;
  serviceName: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string | null;
  bookingSource: "website" | "admin";
  priceAtBooking: number;
};

const PAGE_SIZE = 6;
const nextStatusMap: Record<AppointmentStatus, AppointmentStatus> = {
  pending: "confirmed",
  confirmed: "completed",
  completed: "completed",
  cancelled: "cancelled",
};

const emptyForm = {
  name: "",
  email: "",
  phoneNumber: "",
  serviceId: "",
  appointmentDate: "",
  appointmentTime: "",
  status: "confirmed" as AppointmentStatus,
  notes: "",
};

export default function AdminAppointmentsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, AppointmentStatus>>(
    {}
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function loadPage() {
    try {
      const [appointmentsRes, servicesRes] = await Promise.all([
        fetch("/api/admin/appointments", { cache: "no-store" }),
        fetch("/api/services?mode=admin", { cache: "no-store" }),
      ]);

      const appointmentsPayload = await appointmentsRes.json();
      const servicesPayload = await servicesRes.json();

      if (!appointmentsRes.ok) {
        throw new Error(appointmentsPayload.error || "Failed to load appointments.");
      }

      if (!servicesRes.ok) {
        throw new Error(servicesPayload.error || "Failed to load services.");
      }

      setAppointments(appointmentsPayload.appointments);
      setServices(servicesPayload.services);
      setStatusDrafts(
        Object.fromEntries(
          appointmentsPayload.appointments.map((appointment: Appointment) => [
            appointment.id,
            appointment.status,
          ])
        )
      );
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load appointments.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const endpoint = editingId
        ? `/api/admin/appointments/${editingId}`
        : "/api/admin/appointments";
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          serviceId: Number(form.serviceId),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save appointment.");
      }

      setToast({
        type: "success",
        message:
          editingId ? "Appointment updated successfully." : "Appointment created successfully.",
      });
      setEditingId(null);
      setForm(emptyForm);
      await loadPage();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save appointment.",
      });
    } finally {
      setSaving(false);
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

      setToast({ type: "success", message: payload.message || "Appointment deleted." });
      await loadPage();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete appointment.",
      });
    }
  }

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
        throw new Error(payload.error || "Failed to update status.");
      }

      setToast({ type: "success", message: "Status updated successfully." });
      await loadPage();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update status.",
      });
    }
  }

  function editAppointment(appointment: Appointment) {
    setEditingId(appointment.id);
    setForm({
      name: appointment.name,
      email: appointment.email,
      phoneNumber: appointment.phoneNumber,
      serviceId: String(appointment.serviceId),
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      notes: appointment.notes || "",
    });
  }

  const filteredAppointments = useMemo(() => {
    const base = filterDate
      ? appointments.filter((appointment) => appointment.appointmentDate === filterDate)
      : appointments;

    return base;
  }, [appointments, filterDate]);

  const pagedAppointments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAppointments.slice(start, start + PAGE_SIZE);
  }, [filteredAppointments, page]);
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));

  const stats = useMemo(
    () => ({
      total: filteredAppointments.length,
      pending: filteredAppointments.filter((item) => item.status === "pending").length,
      today: appointments.filter((item) => item.appointmentDate === today).length,
    }),
    [appointments, filteredAppointments, today]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">Total appointments</p>
          <p className="mt-3 text-3xl font-semibold text-purple-950">{stats.total}</p>
        </div>
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-purple-950">{stats.pending}</p>
        </div>
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">Today</p>
          <p className="mt-3 text-3xl font-semibold text-purple-950">{stats.today}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <h1 className="text-3xl font-semibold text-purple-950">
            {editingId ? "Edit appointment" : "Add appointment"}
          </h1>
          <p className="mt-2 text-sm text-purple-600">
            Confirm means accepted. Completed means the work is done and money counts.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {[
              { label: "Customer name", key: "name" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone number", key: "phoneNumber" },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-sm font-semibold text-purple-950">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={form[field.key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Service</label>
              <select
                value={form.serviceId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, serviceId: event.target.value }))
                }
                required
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Date</label>
                <input
                  type="date"
                  value={form.appointmentDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, appointmentDate: event.target.value }))
                  }
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Time</label>
                <input
                  type="time"
                  value={form.appointmentTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, appointmentTime: event.target.value }))
                  }
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Status</label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AppointmentStatus,
                    }))
                  }
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                rows={4}
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Appointment" : "Add Appointment"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-purple-950">Appointment list</h2>
              <p className="mt-2 text-sm text-purple-600">
                Default filter is today. Use the date picker to see previous dates or clear it for all.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="date"
                value={filterDate}
                onChange={(event) => {
                  setFilterDate(event.target.value);
                  setPage(1);
                }}
                className="rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
              <Button type="button" variant="secondary" onClick={() => setFilterDate("")}>
                All dates
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-purple-600">Loading appointments...</div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {pagedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[1.4rem] border border-purple-100 bg-white px-5 py-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-purple-950">{appointment.name}</h3>
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
                              {appointment.status}
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                              {appointment.bookingSource}
                            </span>
                          </div>
                          <p className="text-sm text-purple-600">
                            {appointment.serviceName} • {appointment.appointmentDate} • {appointment.appointmentTime}
                          </p>
                          <p className="text-sm text-purple-600">
                            {appointment.email} • {appointment.phoneNumber}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-purple-500">Note: {appointment.notes}</p>
                          )}
                        </div>

                        <div className="text-sm font-semibold text-purple-950">
                          {(appointment.priceAtBooking / 100).toLocaleString()} ETB
                        </div>
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
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => editAppointment(appointment)}
                        >
                          Edit
                        </Button>
                        <Button type="button" onClick={() => deleteAppointment(appointment.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>

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
