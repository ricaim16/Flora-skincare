// src/components/ui/Textarea.tsx
import { cn } from "../../../lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm",
            "placeholder:text-gray-400 resize-y",
            "focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";