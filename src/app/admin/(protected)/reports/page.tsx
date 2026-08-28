"use client";

import { useMemo, useState } from "react";
import { Pagination } from "../../../components/admin/Pagination";
import { Button } from "../../../components/ui/Button";
import { Toast } from "../../../components/ui/Toast";

type RangeType = "custom" | "weekly" | "monthly" | "yearly";

type GeneratedReport = {
  reportType: RangeType;
  totalAppointments: number;
  completedAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalRevenueInCents: number;
  totalExpensesInCents: number;
  totalTipsInCents: number;
  netRevenueInCents: number;
  startDate: string;
  endDate: string;
  rangeLabel: string;
  generatedAt: string;
};

type HistoryRow = {
  id: number;
  reportType: "weekly" | "monthly" | "yearly";
  totalClients: number;
  totalRevenueInCents: number;
  startDate: string;
  endDate: string;
  createdAt: string;
};

const PAGE_SIZE = 6;

export default function AdminReportsPage() {
  const [rangeType, setRangeType] = useState<RangeType>("custom");
  const [anchorDate, setAnchorDate] = useState(new Date().toISOString().slice(0, 10));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return history.slice(start, start + PAGE_SIZE);
  }, [history, page]);

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));

  async function generateReport() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        type: rangeType,
        date: anchorDate,
      });

      if (rangeType === "custom") {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }

      const response = await fetch(`/api/reports?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate report.");
      }

      setReport(payload.report);
      setHistory(payload.history || []);
      setPage(1);
      setToast({ type: "success", message: "Report generated successfully." });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to generate report.",
      });
    } finally {
      setLoading(false);
    }
  }

  const pdfHref = useMemo(() => {
    const params = new URLSearchParams({
      type: rangeType,
      date: anchorDate,
    });

    if (rangeType === "custom") {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }

    return `/api/admin/reports/pdf?${params.toString()}`;
  }, [anchorDate, endDate, rangeType, startDate]);

  async function downloadPdf() {
    setDownloadingPdf(true);

    const attemptFetch = () => fetch(pdfHref, { cache: "no-store" });

    try {
      let response = await attemptFetch();

      if (!response.ok) {
        response = await attemptFetch();
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to download PDF report.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `flora-${rangeType}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to download PDF report.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reports
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Monthly totals and history</h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose weekly, monthly, yearly, or use custom from-to dates. After generating, the report appears in the table below.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.22fr_0.2fr_0.2fr_0.2fr_0.18fr]">
          <select
            value={rangeType}
            onChange={(event) => setRangeType(event.target.value as RangeType)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
          >
            <option value="custom">From - To</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <input
            type="date"
            value={anchorDate}
            onChange={(event) => setAnchorDate(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />

          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={rangeType !== "custom"}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:opacity-50"
          />

          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={rangeType !== "custom"}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:opacity-50"
          />

          <Button type="button" variant="flat" onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {report && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.3fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-purple-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                  Net money
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {(report.netRevenueInCents / 100).toLocaleString()} ETB
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Completed
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {report.completedAppointments}
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Pending
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {report.pendingAppointments}
                </div>
              </div>
              <div className="rounded-lg bg-rose-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Cancelled
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {report.cancelledAppointments}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Download PDF</h2>
            <p className="mt-2 text-sm text-slate-500">{report.rangeLabel}</p>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={downloadingPdf}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {downloadingPdf ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Report history</h2>
        <p className="mt-2 text-sm text-slate-500">
          The newest generated report appears first, followed by stored weekly, monthly, and yearly reports.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">From</th>
                <th className="px-3 py-3 font-semibold">To</th>
                <th className="px-3 py-3 font-semibold">Appointments</th>
                <th className="px-3 py-3 font-semibold">Net</th>
              </tr>
            </thead>
            <tbody>
              {report && (
                <tr className="border-b border-slate-100 bg-purple-50/60">
                  <td className="px-3 py-3 font-medium text-slate-900">{report.reportType}</td>
                  <td className="px-3 py-3 text-slate-500">{report.startDate}</td>
                  <td className="px-3 py-3 text-slate-500">{report.endDate}</td>
                  <td className="px-3 py-3 text-slate-600">{report.totalAppointments}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {(report.netRevenueInCents / 100).toLocaleString()} ETB
                  </td>
                </tr>
              )}

              {pagedHistory.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900">{row.reportType}</td>
                  <td className="px-3 py-3 text-slate-500">{row.startDate}</td>
                  <td className="px-3 py-3 text-slate-500">{row.endDate}</td>
                  <td className="px-3 py-3 text-slate-600">{row.totalClients}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {(row.totalRevenueInCents / 100).toLocaleString()} ETB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
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
