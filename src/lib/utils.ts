import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the current biweekly period.
 * Periods start on the 1st and 16th of each month.
 */
export function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  let start: Date;
  let end: Date;

  if (day < 16) {
    start = new Date(year, month, 1);
    end = new Date(year, month, 15, 23, 59, 59);
  } else {
    start = new Date(year, month, 16);
    // Last day of month
    end = new Date(year, month + 1, 0, 23, 59, 59);
  }

  return { start, end };
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
