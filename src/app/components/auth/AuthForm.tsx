"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "../ui/Button";

type AuthMode = "login" | "signup";
type AuthRole = "customer" | "admin";

export function AuthForm({
  mode,
  role,
}: {
  mode: AuthMode;
  role: AuthRole;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const copy = useMemo(() => {
    if (mode === "signup") {
      return {
        title: "Create your member account",
        subtitle:
          "Sign up to unlock member-only services while keeping the public page experience the same.",
        submitLabel: "Create Account",
      };
    }

    return {
      title: role === "admin" ? "Manager login" : "Member login",
      subtitle:
        role === "admin"
          ? "Sign in to manage dashboard, reports, services, and appointments."
          : "Log in to view any additional services available for members.",
      submitLabel: role === "admin" ? "Login as Manager" : "Login",
    };
  }, [mode, role]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const endpoint =
        mode === "signup"
          ? "/api/auth/signup"
          : role === "admin"
            ? "/api/admin/login"
            : "/api/auth/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (mode === "signup") {
        router.push("/login?created=1");
        router.refresh();
        return;
      }

      setMessage(data.message || "Success");

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/#services");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-xl rounded-[2rem] p-8 sm:p-10">
      <div className="section-kicker">{role === "admin" ? "Manager" : "Customer"}</div>
      <h1 className="section-heading mt-6 text-4xl text-purple-950">
        {copy.title}
      </h1>
      <p className="section-copy mt-4 text-base">{copy.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {mode === "signup" && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-950">
              Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </div>
        )}

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

        <div>
          <label className="mb-2 block text-sm font-semibold text-purple-950">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
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

        {message && (
          <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : copy.submitLabel}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-purple-700">
        {mode === "login" ? (
          <>
            <Link href={`/forgot-password?role=${role}`} className="font-semibold underline underline-offset-4">
              Forgot password?
            </Link>
            {role === "customer" && (
              <Link href="/signup" className="font-semibold underline underline-offset-4">
                Need an account? Sign up
              </Link>
            )}
          </>
        ) : (
          <Link href="/login" className="font-semibold underline underline-offset-4">
            Already have an account? Login
          </Link>
        )}
      </div>

      {role === "customer" && (
        <div className="mt-5 border-t border-purple-100 pt-5 text-center">
          <Link
            href="/admin/login"
            className="text-sm font-semibold text-purple-700 underline underline-offset-4"
          >
            Manager? Login here
          </Link>
        </div>
      )}
    </div>
  );
}
