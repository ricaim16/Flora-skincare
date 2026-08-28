"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../../../components/admin/Pagination";

type CustomerRow = {
  id: number | null;
  name: string;
  email: string;
  createdAt: string;
  totalAppointments: number;
  completedAppointments: number;
  totalSpentInCents: number;
};

const PAGE_SIZE = 8;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await fetch("/api/admin/customers", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load customers.");
        }

        setCustomers(payload.customers);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load customers."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const pagedCustomers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return customers.slice(start, start + PAGE_SIZE);
  }, [customers, page]);

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
        <p className="mt-2 text-sm text-slate-500">
          Members and booking customers with total appointments and completed work history.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading && <div className="text-sm text-slate-500">Loading customers...</div>}
        {error && <div className="text-sm text-rose-700">{error}</div>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Email</th>
                    <th className="px-3 py-3 font-semibold">Appointments</th>
                    <th className="px-3 py-3 font-semibold">Completed</th>
                    <th className="px-3 py-3 font-semibold">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCustomers.map((customer) => (
                    <tr key={`${customer.email}-${customer.id ?? "guest"}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-900">{customer.name}</td>
                      <td className="px-3 py-3 text-slate-500">{customer.email}</td>
                      <td className="px-3 py-3 text-slate-600">{customer.totalAppointments}</td>
                      <td className="px-3 py-3 text-slate-600">{customer.completedAppointments}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {(customer.totalSpentInCents / 100).toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
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
  );
}
