"use client";

import { CalendarDays, Clock3, MessageSquareMore, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toast } from "./ui/Toast";

type Service = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  durationMinutes: number;
  priceInCents: number;
};

const slotTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

function formatTimeLabel(time: string) {
  const [hourRaw, minute] = time.split(":");
  const hour = Number(hourRaw);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${suffix}`;
}

export default function BookingForm() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
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
        setServicesError("We couldn't load our treatments right now. Please refresh or check back shortly.");
      } finally {
        setLoadingServices(false);
      }
    }

    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();

        if (data.session?.role === "customer") {
          setForm((current) => ({
            ...current,
            name: current.name || data.session.name || "",
            email: current.email || data.session.email || "",
          }));
        }
      } catch {
        // ignore session prefill failures
      } finally {
        setSessionLoaded(true);
      }
    }

    fetchSession();
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

  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === form.serviceId) ?? null,
    [form.serviceId, services]
  );

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
        email: "",
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

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-purple-100 bg-white/90 p-5 shadow-[0_22px_48px_rgba(86,46,132,0.08)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-purple-400 text-white shadow-[0_16px_24px_rgba(118,66,183,0.24)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
                Book Appointment
              </p>
              <p className="text-sm text-purple-700">
                Choose your service first, then pick your day and time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-2 text-sm font-semibold text-purple-950">
                Full name
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 text-sm font-semibold text-purple-950">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] placeholder:text-purple-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
                {sessionLoaded && form.email && (
                  <span className="mt-2 text-xs font-medium text-purple-500">
                    Your account email was filled automatically.
                  </span>
                )}
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
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
                Choose your treatment
              </h3>
              {selectedService && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  Selected
                </span>
              )}
            </div>

            {loadingServices ? (
              <div className="rounded-[1.5rem] border border-purple-100 bg-purple-50/60 p-4 text-sm text-purple-700">
                Loading services...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const active = String(service.id) === form.serviceId;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          serviceId: String(service.id),
                        }))
                      }
                      className={`rounded-[1.4rem] border p-4 text-left transition ${
                        active
                          ? "border-transparent bg-gradient-to-br from-purple-700 via-fuchsia-600 to-purple-500 text-white shadow-[0_20px_32px_rgba(121,57,201,0.24)]"
                          : "border-purple-200 bg-white text-purple-950 hover:border-purple-300 hover:bg-purple-50/60"
                      }`}
                    >
                      <div className="text-base font-semibold">{service.name}</div>
                      <div
                        className={`mt-2 text-sm leading-6 ${
                          active ? "text-white/85" : "text-purple-600"
                        }`}
                      >
                        {service.description}
                      </div>
                      <div
                        className={`mt-3 text-xs font-semibold uppercase tracking-[0.18em] ${
                          active ? "text-white/80" : "text-purple-500"
                        }`}
                      >
                        {service.durationMinutes} min • {(service.priceInCents / 100).toLocaleString()} ETB
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-purple-100 bg-white/90 p-5 shadow-[0_22px_48px_rgba(86,46,132,0.08)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
                Select Date and Time
              </p>
              <p className="text-sm text-purple-700">
                Working hours are from 9:00 AM to 7:00 PM.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="notes"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-950"
            >
              <MessageSquareMore className="h-4 w-4 text-purple-500" />
              Note
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any note about your skin concern or preferred visit."
              className="w-full rounded-[1.2rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] placeholder:text-purple-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <label
                htmlFor="appointmentDate"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-950"
              >
                <CalendarDays className="h-4 w-4 text-purple-500" />
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

              {selectedService && (
                <div className="mt-4 rounded-[1.35rem] bg-purple-50/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">
                    Appointment summary
                  </p>
                  <p className="mt-2 text-lg font-semibold text-purple-950">
                    {selectedService.name}
                  </p>
                  <p className="mt-1 text-sm text-purple-600">
                    {selectedService.durationMinutes} minutes
                  </p>
                  <p className="mt-3 text-sm font-semibold text-purple-800">
                    {(selectedService.priceInCents / 100).toLocaleString()} ETB
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-950">
                <Clock3 className="h-4 w-4 text-purple-500" />
                Available slots
              </label>
              <div className="rounded-[1.35rem] border border-purple-100 bg-[#fcf9ff] p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {slotTimes.map((time) => {
                    const active = form.appointmentTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            appointmentTime: time,
                          }))
                        }
                        className={`rounded-[1rem] border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-transparent bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-500 text-white shadow-[0_16px_22px_rgba(117,57,187,0.24)]"
                            : "border-purple-200 bg-white text-purple-900 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                      >
                        {formatTimeLabel(time)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <input type="hidden" name="serviceId" value={form.serviceId} />
          <input type="hidden" name="appointmentTime" value={form.appointmentTime} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  appointmentDate: "",
                  appointmentTime: "",
                  notes: "",
                }))
              }
              className="w-full rounded-full border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-purple-800 transition hover:border-purple-300 hover:bg-purple-50 sm:w-auto sm:min-w-40"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={
                loadingSubmit ||
                services.length === 0 ||
                !form.serviceId ||
                !form.appointmentDate ||
                !form.appointmentTime
              }
              className="w-full rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-500 px-6 py-3 font-bold text-white shadow-[0_18px_34px_rgba(117,57,187,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50 sm:ml-auto sm:w-auto sm:min-w-44"
            >
              {loadingSubmit ? "Booking..." : "Next"}
            </button>
          </div>
        </section>
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
