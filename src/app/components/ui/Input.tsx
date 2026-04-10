"use client";

import { cn } from "../../../lib/utils";
import { forwardRef, InputHTMLAttributes, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const reactId = useId();
    const inputId = id || reactId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-purple-950"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "block w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)] backdrop-blur-sm",
            "placeholder:text-purple-400 transition-colors",
            "focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-purple-50 disabled:text-purple-400",
            error && "border-red-400 focus:border-red-400 focus:ring-red-200",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
