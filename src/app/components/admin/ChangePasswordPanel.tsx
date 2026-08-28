"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Toast } from "../ui/Toast";

export function ChangePasswordPanel() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update password.");
      }

      setForm({
        currentPassword: "",
        newPassword: "",
      });
      setToast({
        type: "success",
        message: payload.message || "Password updated successfully.",
      });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update password.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
      <h1 className="text-3xl font-semibold text-purple-950">Change password</h1>
      <p className="mt-2 text-sm text-purple-600">
        Update the manager password here or use forgot password with OTP on the login page.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-purple-950">
            Current password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currentPassword: event.target.value,
              }))
            }
            required
            className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-purple-950">
            New password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
            required
            className="w-full rounded-[1.15rem] border border-purple-200 bg-white px-4 py-3 text-sm text-purple-950 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Update Password"}
        </Button>
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
