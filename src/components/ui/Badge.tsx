import * as React from "react";
import { cn } from "@/lib/utils";

// Componente para mostrar badges con diferentes variantes.
export type BadgeVariant = "default" | "success" | "warning" | "danger";

// Se definen los estilos para cada variante de badge.
export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-white/10 text-white/80",
    success: "bg-green-500/15 text-green-200",
    warning: "bg-yellow-500/15 text-yellow-200",
    danger: "bg-red-500/15 text-red-200",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  );
}

