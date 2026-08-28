"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus2, EllipsisVertical, Eye, ListTodo, Pencil, Trash2 } from "lucide-react";
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

const statusBadgeClasses: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
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
      setShowForm(false);
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

  function editAppointment(appointment: Appointment) {
    setOpenMenuId(null);
    setSelectedAppointment(null);
    setEditingId(appointment.id);
    setShowForm(true);
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
      total: appointments.length,
      pending: appointments.filter((item) => item.status === "pending").length,
      today: appointments.filter((item) => item.appointmentDate === today).length,
    }),
    [appointments, today]
  );

  function openCreateForm() {
    setOpenMenuId(null);
    setSelectedAppointment(null);
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function openDetails(appointment: Appointment) {
    setOpenMenuId(null);
    setSelectedAppointment(appointment);
  }

  function closeDetails() {
    setSelectedAppointment(null);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total appointments</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.today}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <ListTodo className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Appointment list</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                All appointments show by default. Use the date picker only if you want to filter.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="flat" onClick={openCreateForm}>
                <CalendarPlus2 className="h-4 w-4" />
                Add appointment
              </Button>
              <input
                type="date"
                value={filterDate}
                onChange={(event) => {
                  setFilterDate(event.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-slate-500">Loading appointments...</div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white lg:overflow-visible">
                <table className="min-w-[720px] w-full table-fixed border-collapse lg:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="w-[20%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name
                      </th>
                      <th className="w-[18%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Service
                      </th>
                      <th className="w-[22%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Schedule
                      </th>
                      <th className="w-[14%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="w-[12%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Price
                      </th>
                      <th className="w-[14%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAppointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No appointments found for this date.
                        </td>
                      </tr>
                    ) : (
                      pagedAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <div className="truncate text-sm font-medium text-slate-900">
                              {appointment.name}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="truncate">{appointment.serviceName || "Service"}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div>{appointment.appointmentDate}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {appointment.appointmentTime}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClasses[appointment.status]}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                            {(appointment.priceAtBooking / 100).toLocaleString()} ETB
                          </td>
                          <td className="relative px-4 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((current) =>
                                  current === appointment.id ? null : appointment.id
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                              aria-label={`Open actions for ${appointment.name}`}
                            >
                              <EllipsisVertical className="h-4 w-4" />
                            </button>

                            {openMenuId === appointment.id ? (
                              <div className="absolute right-0 top-11 z-10 min-w-[150px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openDetails(appointment)}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Eye className="h-4 w-4 text-slate-500" />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => editAppointment(appointment)}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Pencil className="h-4 w-4 text-slate-500" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    deleteAppointment(appointment.id);
                                  }}
                                  className="flex w-full items-center gap-2.5 rounded-[0.8rem] px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-5">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 sm:px-6">
          <div className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingId ? "Edit appointment" : "Add appointment"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Confirm means accepted. Completed means the work is done and money counts.
                </p>
              </div>
              <Button type="button" variant="flat-secondary" onClick={closeForm}>
                Close
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {[
                { label: "Customer name", key: "name" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone number", key: "phoneNumber" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
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
                    required={field.key !== "email"}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service
                </label>
                <select
                  value={form.serviceId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, serviceId: event.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.appointmentDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        appointmentDate: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.appointmentTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        appointmentTime: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as AppointmentStatus,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="flat" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Appointment" : "Add Appointment"}
                </Button>
                <Button type="button" variant="flat-secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedAppointment ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 sm:px-6">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Appointment details</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Full information for this appointment.
                </p>
              </div>
              <Button type="button" variant="flat-secondary" onClick={closeDetails}>
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedAppointment.name}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedAppointment.serviceName || "Service"}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedAppointment.appointmentDate}
                </div>
                <div className="text-sm text-slate-500">
                  {selectedAppointment.appointmentTime}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {(selectedAppointment.priceAtBooking / 100).toLocaleString()} ETB
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedAppointment.email || "-"}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedAppointment.phoneNumber}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </div>
                <div className="mt-2 text-base font-semibold capitalize text-slate-900">
                  {selectedAppointment.status}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Source
                </div>
                <div className="mt-2 text-base font-semibold capitalize text-slate-900">
                  {selectedAppointment.bookingSource}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {selectedAppointment.notes || "No notes for this appointment."}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
