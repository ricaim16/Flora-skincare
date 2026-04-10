"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toast } from "./ui/Toast";

type Service = {
  id: number;
  name: string;
  slug: string;
  durationMinutes: number;
  priceInCents: number;
};

export default function BookingForm() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch services");
        }

        setServices(data.services || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch services";
        console.error("Failed to fetch services:", message);
        setServicesError(message);
      } finally {
        setLoadingServices(false);
      }
    }

    fetchServices();
  }, []);

  useEffect(() => {
    const serviceId = searchParams.get("serviceId");

    if (serviceId) {
      setForm((current) => ({ ...current, serviceId }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setToast(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceId: Number(form.serviceId),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setToast({
        message: "Appointment successfully booked.",
        type: "success",
      });
      setForm({
        name: "",
        phoneNumber: "",
        serviceId: "",
        appointmentDate: "",
        appointmentTime: "",
        notes: "",
      });
    } catch (error: unknown) {
      setToast({
        message: error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div>
      {servicesError && (
        <div className="mb-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-700">
          {servicesError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-2 text-sm font-semibold text-purple-950">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] placeholder:text-purple-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="mb-2 text-sm font-semibold text-purple-950">
            Phone
          </label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] placeholder:text-purple-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="serviceId" className="mb-2 text-sm font-semibold text-purple-950">
            Service
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            required
            disabled={loadingServices || services.length === 0}
            className="w-full cursor-pointer rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
          >
            <option value="">
              {loadingServices
                ? "Loading services..."
                : services.length === 0
                ? "No services available"
                : "Select a Service"}
            </option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {service.durationMinutes} min —{" "}
                {(service.priceInCents / 100).toLocaleString()} ETB
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="appointmentDate" className="mb-2 text-sm font-semibold text-purple-950">
              Date
            </label>
            <input
              id="appointmentDate"
              type="date"
              name="appointmentDate"
              value={form.appointmentDate}
              onChange={handleChange}
              required
              min={today}
              className="w-full cursor-pointer rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="appointmentTime" className="mb-2 text-sm font-semibold text-purple-950">
              Time
            </label>
            <input
              id="appointmentTime"
              type="time"
              name="appointmentTime"
              value={form.appointmentTime}
              onChange={handleChange}
              required
              min="09:00"
              max="18:00"
              className="w-full cursor-pointer rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="notes" className="mb-2 text-sm font-semibold text-purple-950">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] placeholder:text-purple-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <button
          type="submit"
          disabled={loadingSubmit || services.length === 0}
          className="w-full rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-500 py-3 font-bold text-white shadow-[0_18px_34px_rgba(117,57,187,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loadingSubmit ? "Booking..." : "Confirm Appointment"}
        </button>
      </form>

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
