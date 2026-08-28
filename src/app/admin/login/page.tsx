import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "../../components/auth/AuthForm";
import { getCurrentSession } from "../../../lib/auth";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session?.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="page-shell min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl justify-between pb-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
          Flora Skincare
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="section-kicker">Manager Portal</div>
          <h1 className="section-heading text-5xl text-purple-950">
            Control bookings, services, reports, and clinic performance.
          </h1>
          <p className="section-copy max-w-xl text-lg">
            This admin side is for the clinic manager only. Use your manager email and password to sign in, then change the password anytime or reset it by OTP.
          </p>
        </div>

        <AuthForm mode="login" role="admin" />
      </div>
    </div>
  );
}
