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
        {label && (
          <label className="block text-sm font-semibold text-purple-950">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-[1.15rem] border border-purple-200/80 bg-white/90 px-4 py-3 text-sm text-purple-950 shadow-[0_12px_28px_rgba(90,45,140,0.07)]",
            "resize-y placeholder:text-purple-400",
            "focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-purple-50 disabled:text-purple-400",
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
