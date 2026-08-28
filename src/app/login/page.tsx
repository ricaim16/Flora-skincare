import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "../components/auth/AuthForm";
import { getCurrentSession } from "../../lib/auth";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session?.role === "customer") {
    redirect("/");
  }

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <AuthForm mode="login" role="customer" />
      </div>
    </div>
  );
}
