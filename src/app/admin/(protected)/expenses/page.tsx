"use client";

import { useEffect, useMemo, useState } from "react";
import { ReceiptText, WalletCards } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false);
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

  function closeForm() {
    setForm({
      title: "",
      note: "",
      entryType: "expense",
      amount: "",
      entryDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <WalletCards className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expense tools
                </p>
                <h1 className="mt-2 text-xl font-semibold text-slate-900">Expenses</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Open the left form when you want to add an expense or tip entry.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button type="button" variant="flat" onClick={() => setShowForm(true)}>
                    Expense
                  </Button>
                  {showForm && (
                    <Button type="button" variant="flat-secondary" onClick={closeForm}>
                      Close form
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Expense</h2>
              <p className="mt-2 text-sm text-slate-500">
                Add money out as expense, or add tip so the dashboard totals update correctly.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                    <select
                      value={form.entryType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          entryType: event.target.value as "expense" | "tip",
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="expense">Expense</option>
                      <option value="tip">Tip</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Amount (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, amount: event.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, entryDate: event.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Note</label>
                  <textarea
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, note: event.target.value }))
                    }
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" variant="flat">Save Entry</Button>
                  <Button type="button" variant="flat-secondary" onClick={closeForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ReceiptText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Entries</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">Every admin-side list uses pagination.</p>

          {loading ? (
            <div className="mt-6 text-sm text-slate-500">Loading entries...</div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold">Title</th>
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Amount</th>
                      <th className="px-3 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-3 text-slate-500">{entry.entryDate}</td>
                        <td className="px-3 py-3 text-slate-900">
                          <div className="font-semibold">{entry.title}</div>
                          {entry.note && <div className="text-xs text-slate-500">{entry.note}</div>}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{entry.entryType}</td>
                        <td className="px-3 py-3 text-slate-600">
                          {(entry.amountInCents / 100).toLocaleString()} ETB
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => deleteEntry(entry.id)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </button>
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
