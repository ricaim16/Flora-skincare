import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import { getCurrentSession } from "../../../lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminShell session={{ name: session.name, email: session.email }}>{children}</AdminShell>;
}
