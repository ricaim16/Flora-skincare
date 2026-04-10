"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[1.4rem] border px-4 py-4 shadow-[0_20px_40px_rgba(40,14,66,0.18)] backdrop-blur-xl",
          type === "success"
            ? "border-emerald-200 bg-white/95 text-emerald-700"
            : "border-rose-200 bg-white/95 text-rose-700",
        )}
        role="status"
        aria-live="polite"
      >
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            type === "success" ? "bg-emerald-100" : "bg-rose-100",
          )}
        >
          {type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <CircleAlert className="h-5 w-5" />
          )}
        </div>

        <p className="flex-1 text-sm font-semibold">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
