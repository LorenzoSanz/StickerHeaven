import * as React from "react";
import { cn } from "@/lib/utils";

// Componente para mostrar tarjetas con diferentes estilos y contenido.
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-white/10 bg-surface shadow-sm", className)} {...props} />;
}
// Componente para mostrar encabezados de tarjetas con diferentes estilos y contenido.
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}
// Componente para mostrar títulos de tarjetas con diferentes estilos y contenido.
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}
// Componente para mostrar descripciones de tarjetas con diferentes estilos y contenido.
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-white/60", className)} {...props} />;
}
// Componente para mostrar contenido de tarjetas con diferentes estilos y contenido.
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
