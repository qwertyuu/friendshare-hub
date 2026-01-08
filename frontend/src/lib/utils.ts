import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAPIUrl(): string {
  if (typeof window !== "undefined" && window.ENV?.VITE_API_URL) {
    return window.ENV.VITE_API_URL;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:3000";
}
