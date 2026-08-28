"use client";

import { useEffect, useMemo, useState } from "react";
import { EllipsisVertical, Eye, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Pagination } from "../../../components/admin/Pagination";
import { Button } from "../../../components/ui/Button";
import { Toast } from "../../../components/ui/Toast";

type Service = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  durationMinutes: number;
  priceInCents: number;
  isActive: boolean;
  isMembersOnly: boolean;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  durationMinutes: "60",
  priceInCents: "",
  isActive: true,
  isMembersOnly: false,
};

const PAGE_SIZE = 6;

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function loadServices() {
    try {
      const response = await fetch("/api/services?mode=admin", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load services.");
      }

      setServices(payload.services);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load services.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
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
      const endpoint = editingId ? `/api/services/${editingId}` : "/api/services";
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          imageUrl: form.imageUrl,
          durationMinutes: Number(form.durationMinutes),
          priceInCents: Number(form.priceInCents),
          isActive: form.isActive,
          isMembersOnly: form.isMembersOnly,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save service.");
      }

      setToast({
        type: "success",
        message: editingId ? "Service updated successfully." : "Service created successfully.",
      });
      setEditingId(null);
      setForm(emptyForm);
      setShowForm(false);
      await loadServices();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save service.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this service?")) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete service.");
      }

      setToast({ type: "success", message: payload.message || "Service deleted successfully." });
      await loadServices();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete service.",
      });
    }
  }

  function startEditing(service: Service) {
    setOpenMenuId(null);
    setSelectedService(null);
    setEditingId(service.id);
    setShowForm(true);
    setForm({
      name: service.name,
      slug: service.slug,
      description: service.description,
      imageUrl: service.imageUrl || "",
      durationMinutes: String(service.durationMinutes),
      priceInCents: String(service.priceInCents),
      isActive: service.isActive,
      isMembersOnly: service.isMembersOnly,
    });
  }

  const pagedServices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return services.slice(start, start + PAGE_SIZE);
  }, [page, services]);
  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE));

  function openCreateForm() {
    setOpenMenuId(null);
    setSelectedService(null);
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function openDetails(service: Service) {
    setOpenMenuId(null);
    setSelectedService(service);
  }

  function closeDetails() {
    setSelectedService(null);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total services</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{services.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {services.filter((service) => service.isActive).length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inactive</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {services.filter((service) => !service.isActive).length}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Published services</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                These changes update the homepage service list.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="flat" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                Add service
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-slate-500">Loading services...</div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white lg:overflow-visible">
                <table className="min-w-[760px] w-full table-fixed border-collapse lg:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="w-[24%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name
                      </th>
                      <th className="w-[20%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Slug
                      </th>
                      <th className="w-[16%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Duration
                      </th>
                      <th className="w-[14%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Price
                      </th>
                      <th className="w-[12%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="w-[14%] px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedServices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No services found.
                        </td>
                      </tr>
                    ) : (
                      pagedServices.map((service) => (
                        <tr
                          key={service.id}
                          className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <div className="truncate text-sm font-medium text-slate-900">
                              {service.name}
                            </div>
                            {service.isMembersOnly ? (
                              <div className="mt-1 text-xs text-amber-700">Login only</div>
                            ) : null}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="truncate">{service.slug}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {service.durationMinutes} min
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                            {(service.priceInCents / 100).toLocaleString()} ETB
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                service.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="relative px-4 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((current) =>
                                  current === service.id ? null : service.id
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                              aria-label={`Open actions for ${service.name}`}
                            >
                              <EllipsisVertical className="h-4 w-4" />
                            </button>

                            {openMenuId === service.id ? (
                              <div className="absolute right-0 top-11 z-10 min-w-[150px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openDetails(service)}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Eye className="h-4 w-4 text-slate-500" />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditing(service)}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Pencil className="h-4 w-4 text-slate-500" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDelete(service.id);
                                  }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
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
                  {editingId ? "Edit service" : "Add service"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Add, edit, delete, or switch a service to inactive.
                </p>
              </div>
              <Button type="button" variant="flat-secondary" onClick={closeForm}>
                Close
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Image URL or path
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                  placeholder="/Consultation.jpg"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={form.durationMinutes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        durationMinutes: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Price in cents
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.priceInCents}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priceInCents: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                  />
                  Active on homepage
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isMembersOnly}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isMembersOnly: event.target.checked,
                      }))
                    }
                  />
                  Show after login
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="flat" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Service" : "Add Service"}
                </Button>
                <Button type="button" variant="flat-secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedService ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 sm:px-6">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Service details</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Full information for this service.
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
                  {selectedService.name}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slug
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedService.slug}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedService.durationMinutes} min
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {(selectedService.priceInCents / 100).toLocaleString()} ETB
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedService.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visibility
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {selectedService.isMembersOnly ? "Login only" : "Public"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {selectedService.description || "No description for this service."}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Image
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {selectedService.imageUrl || "No image"}
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
