// src/components/ui/Checkbox.tsx
import { cn } from "../../../lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500",
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700">{label}</span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";