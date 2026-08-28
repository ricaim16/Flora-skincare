"use client";

import { useEffect, useMemo, useState } from "react";
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
    setEditingId(service.id);
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">Total services</p>
          <p className="mt-3 text-3xl font-semibold text-purple-950">{services.length}</p>
        </div>
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-purple-950">
            {services.filter((service) => service.isActive).length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">Inactive</p>
          <p className="mt-3 text-3xl font-semibold text-purple-950">
            {services.filter((service) => !service.isActive).length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <h1 className="text-3xl font-semibold text-purple-950">
            {editingId ? "Edit service" : "Add service"}
          </h1>
          <p className="mt-2 text-sm text-purple-600">
            Add, edit, delete, or switch a service to inactive. If login-only services are needed, keep the extra visibility switch on.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Slug</label>
              <input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                required
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Description</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Image URL or path</label>
              <input
                value={form.imageUrl}
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="/Consultation.jpg"
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Duration (min)</label>
                <input
                  type="number"
                  min="15"
                  value={form.durationMinutes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, durationMinutes: event.target.value }))
                  }
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Price in cents</label>
                <input
                  type="number"
                  min="0"
                  value={form.priceInCents}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, priceInCents: event.target.value }))
                  }
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-purple-950">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                Active on homepage
              </label>
              <label className="flex items-center gap-3 rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-purple-950">
                <input
                  type="checkbox"
                  checked={form.isMembersOnly}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isMembersOnly: event.target.checked }))
                  }
                />
                Show after login
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Service" : "Add Service"}
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
          <h2 className="text-2xl font-semibold text-purple-950">Published services</h2>
          <p className="mt-2 text-sm text-purple-600">
            These changes update the same data the homepage reads.
          </p>

          {loading ? (
            <div className="mt-6 text-sm text-purple-600">Loading services...</div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {pagedServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-[1.4rem] border border-purple-100 bg-white px-5 py-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-purple-950">{service.name}</h3>
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                          {service.isMembersOnly && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                              Login only
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-purple-600">{service.description}</p>
                        <div className="text-sm text-purple-500">
                          {service.durationMinutes} min • {(service.priceInCents / 100).toLocaleString()} ETB
                        </div>
                        <div className="text-xs text-purple-400">Image: {service.imageUrl || "No image"}</div>
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => startEditing(service)}>
                          Edit
                        </Button>
                        <Button type="button" onClick={() => handleDelete(service.id)}>
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
