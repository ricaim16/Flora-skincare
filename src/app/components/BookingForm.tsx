"use client";

import { useEffect, useState } from "react";

type Service = {
  id: number;
  name: string;
  slug: string;
  durationMinutes: number;
  priceInCents: number;
};

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        setServices(data.services || []);
      } catch (error) {
        console.error("Failed to fetch services");
      } finally {
        setLoadingServices(false);
      }
    }

    fetchServices();
  }, []);

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
    setMessage(null);

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

      setMessage("✨ Appointment successfully booked!");
      setForm({
        name: "",
        phoneNumber: "",
        serviceId: "",
        appointmentDate: "",
        appointmentTime: "",
        notes: "",
      });
    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div>
      {message && (
        <div className="mb-6 p-4 rounded bg-gray-100 text-center text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NAME */}
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* PHONE */}
        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="mb-1 font-medium">
            Phone
          </label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* SERVICE DROPDOWN */}
        <div className="flex flex-col">
          <label htmlFor="serviceId" className="mb-1 font-medium">
            Service
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            required
            disabled={loadingServices || services.length === 0}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer"
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

        {/* DATE + TIME */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="appointmentDate" className="mb-1 font-medium">
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
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="appointmentTime" className="mb-1 font-medium">
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
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* NOTES */}
        <div className="flex flex-col">
          <label htmlFor="notes" className="mb-1 font-medium">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loadingSubmit || services.length === 0}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loadingSubmit ? "Booking..." : "Confirm Appointment"}
        </button>
      </form>
    </div>
  );
}
