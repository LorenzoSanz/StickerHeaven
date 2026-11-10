import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EUR") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDateISO(dateIso: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
    ...opts,
  }).format(d);
}
