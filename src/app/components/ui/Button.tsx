"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...props
}: ButtonProps) => {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    size === "sm"
      ? "px-4 py-2 text-sm"
      : size === "md"
        ? "px-5 py-3 text-sm"
        : "px-7 py-3.5 text-base",
    variant === "primary"
      ? "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-500 text-white shadow-[0_18px_34px_rgba(117,57,187,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(117,57,187,0.3)]"
      : "border border-purple-200 bg-white/80 text-purple-900 shadow-[0_16px_30px_rgba(95,52,155,0.08)] backdrop-blur hover:-translate-y-0.5 hover:border-purple-300 hover:bg-white",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
