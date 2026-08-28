"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "../ui/Button";

export function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "admin" ? "admin" : "customer";
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
  });

  const loginHref = useMemo(
    () => (role === "admin" ? "/admin/login" : "/login"),
    [role]
  );

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send code.");
      }

      setPreviewCode(data.previewCode || null);
      setMessage("Verification code sent. Check your email and continue below.");
      setStep("reset");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to send code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          code: form.code,
          newPassword: form.newPassword,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to reset password.");
      }

      router.push(`${loginHref}?reset=1`);
      router.refresh();
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-xl rounded-[2rem] p-8 sm:p-10">
      <div className="section-kicker">Password Reset</div>
      <h1 className="section-heading mt-6 text-4xl text-purple-950">
        {role === "admin" ? "Reset manager password" : "Reset your password"}
      </h1>
      <p className="section-copy mt-4 text-base">
        We&apos;ll send a one-time code to your email, then you can enter a new password.
      </p>

      {step === "request" ? (
        <form onSubmit={requestCode} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-950">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>

          {error && (
            <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending code..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-950">
              Verification Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm tracking-[0.3em] text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-950">
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>

          {message && (
            <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

          {previewCode && (
            <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              Email is not configured in this environment yet. Test OTP: {previewCode}
            </div>
          )}

          {error && (
            <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating password..." : "Save New Password"}
          </Button>
        </form>
      )}

      <div className="mt-6">
        <Link href={loginHref} className="text-sm font-semibold text-purple-700 underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </div>
  );
}
