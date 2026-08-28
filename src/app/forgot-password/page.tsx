import { Suspense } from "react";
import Link from "next/link";
import { PasswordResetForm } from "../components/auth/PasswordResetForm";

export default function ForgotPasswordPage() {
  return (
    <div className="page-shell min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl justify-between pb-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
          Flora Skincare
        </Link>
      </div>
      <div className="flex min-h-[70vh] items-center justify-center">
        <Suspense fallback={<div className="text-sm text-purple-600">Loading password reset...</div>}>
          <PasswordResetForm />
        </Suspense>
      </div>
    </div>
  );
}
