/**
 * POR QUÉ: Un route group (protected) no aplica seguridad por sí solo; necesitamos una barrera server-side.
 * QUÉ: Este layout valida sesión y redirige a /login si el usuario no está autenticado.
 */
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/serverApi";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const me = await serverApiFetch<{ user: { id: string } }>("/api/auth/me", { method: "GET" }).catch(() => null);
  if (!me?.user?.id) redirect("/login");
  return <>{children}</>;
}

