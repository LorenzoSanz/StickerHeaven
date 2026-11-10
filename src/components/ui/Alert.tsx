import * as React from "react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export function Alert({
  className,
  variant = "info",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  const variants: Record<AlertVariant, string> = {
    info: "border-white/10 bg-white/5 text-foreground",
    success: "border-green-500/20 bg-green-500/10 text-green-100",
    warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-100",
    danger: "border-red-500/20 bg-red-500/10 text-red-100",
  };

  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", variants[variant], className)} {...props} />
  );
}

