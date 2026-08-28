"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

export function LogoutButton({
  redirectTo,
  label = "Logout",
  variant = "secondary",
}: {
  redirectTo: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} onClick={handleLogout}>
      {label}
    </Button>
  );
}
