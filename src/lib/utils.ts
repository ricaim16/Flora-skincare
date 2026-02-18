import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes intelligently (handles conflicts, duplicates, etc.)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}