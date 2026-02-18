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
    const inputId = id || reactId; // stable ID

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm",
            "placeholder:text-gray-400 transition-colors",
            "focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
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
