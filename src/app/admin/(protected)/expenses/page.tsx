"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../../../components/admin/Pagination";
import { Button } from "../../../components/ui/Button";
import { Toast } from "../../../components/ui/Toast";

type ExpenseRow = {
  id: number;
  title: string;
  note: string | null;
  entryType: "expense" | "tip";
  amountInCents: number;
  entryDate: string;
};

const PAGE_SIZE = 8;

export default function AdminExpensesPage() {
  const [entries, setEntries] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [form, setForm] = useState({
    title: "",
    note: "",
    entryType: "expense" as "expense" | "tip",
    amount: "",
    entryDate: new Date().toISOString().slice(0, 10),
  });

  async function loadEntries() {
    try {
      const response = await fetch("/api/admin/expenses", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load entries.");
      }

      setEntries(payload.expenses);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load entries.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
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

    try {
      const response = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          note: form.note,
          entryType: form.entryType,
          amountInCents: Math.round(Number(form.amount) * 100),
          entryDate: form.entryDate,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save entry.");
      }

      setForm({
        title: "",
        note: "",
        entryType: "expense",
        amount: "",
        entryDate: new Date().toISOString().slice(0, 10),
      });
      setToast({ type: "success", message: payload.message || "Saved successfully." });
      await loadEntries();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save entry.",
      });
    }
  }

  async function deleteEntry(id: number) {
    try {
      const response = await fetch(`/api/admin/expenses/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete entry.");
      }

      setToast({ type: "success", message: payload.message || "Deleted successfully." });
      await loadEntries();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete entry.",
      });
    }
  }

  const pagedEntries = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [entries, page]);
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <h1 className="text-3xl font-semibold text-purple-950">Expense</h1>
          <p className="mt-2 text-sm text-purple-600">
            Add money out as expense, or add tip so the dashboard totals update correctly.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Type</label>
                <select
                  value={form.entryType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      entryType: event.target.value as "expense" | "tip",
                    }))
                  }
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                >
                  <option value="expense">Expense</option>
                  <option value="tip">Tip</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-purple-950">Amount (ETB)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  required
                  className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Date</label>
              <input
                type="date"
                value={form.entryDate}
                onChange={(event) => setForm((current) => ({ ...current, entryDate: event.target.value }))}
                required
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-950">Note</label>
              <textarea
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                rows={4}
                className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <Button type="submit">Save Entry</Button>
          </form>
        </div>

        <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
          <h2 className="text-2xl font-semibold text-purple-950">Entries</h2>
          <p className="mt-2 text-sm text-purple-600">Every admin-side list uses pagination.</p>

          {loading ? (
            <div className="mt-6 text-sm text-purple-600">Loading entries...</div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-purple-100 text-purple-500">
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold">Title</th>
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Amount</th>
                      <th className="px-3 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-purple-50">
                        <td className="px-3 py-3 text-purple-600">{entry.entryDate}</td>
                        <td className="px-3 py-3 text-purple-950">
                          <div className="font-semibold">{entry.title}</div>
                          {entry.note && <div className="text-xs text-purple-500">{entry.note}</div>}
                        </td>
                        <td className="px-3 py-3 text-purple-700">{entry.entryType}</td>
                        <td className="px-3 py-3 text-purple-700">
                          {(entry.amountInCents / 100).toLocaleString()} ETB
                        </td>
                        <td className="px-3 py-3">
                          <Button type="button" onClick={() => deleteEntry(entry.id)}>
                            Delete
                          </Button>
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
