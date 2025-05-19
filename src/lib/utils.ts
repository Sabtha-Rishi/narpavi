
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(value);
}

export function debounce<F extends (...args: any[]) => any>(
  fn: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeoutID: number | undefined;

  return function(...args: Parameters<F>) {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => fn(...args), delay);
  };
}
