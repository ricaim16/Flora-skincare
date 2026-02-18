"use client";

import Link from "next/link";
import { cn } from "../../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string; // optional href for links
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: ButtonProps) => {
  const classes = cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "px-3 py-1.5 text-sm" : size === "md" ? "px-4 py-2.5 text-md" : "px-6 py-3 text-lg",
    variant === "primary"
      ? "bg-purple-600 text-white hover:bg-purple-700"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
  );

  // If href is passed, render as a link
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
