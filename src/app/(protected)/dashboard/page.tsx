/**
 * PROPÓSITO: Página de Next.js para un segmento de navegación del usuario.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { getCurrentUser } from "./actions";
import Link from "next/link";
import { Package, Sparkles, Star, User } from "lucide-react";

// Página principal del dashboard.
export default async function DashboardPage() {
  const user = await getCurrentUser("/dashboard");

  return (
    <div className="px-4">
      {/* POR QUÉ: Centramos el panel para evitar “espacios muertos” y dar un acceso rápido a cada área del dashboard. */}
      <div className="min-h-[calc(100dvh-96px)] grid place-items-center py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
            <p className="mt-2 text-white/60">
              Bienvenido, <span className="text-white/80 font-semibold">{user.name}</span>
            </p>
          </div>

          {/* POR QUÉ: Tiles cuadrados y flotantes que llevan a cada sección sin depender de navegación secundaria. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/orders"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-5 transition-all duration-200 aspect-square hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-light hover:shadow-[0_0_28px_rgba(139,92,246,0.22)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 p-3 shadow-[0_0_28px_rgba(139,92,246,0.18)]">
                    <Package className="h-6 w-6 text-primary-light" />
                  </div>
                  <div className="text-lg font-bold text-foreground">Pedidos</div>
                  <div className="mt-1 text-sm text-white/60">Historial y estado de compras</div>
                </div>
                <div className="text-sm font-semibold text-white/70 group-hover:text-white">Entrar →</div>
              </div>
            </Link>

            <Link
              href="/dashboard/stickers"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-5 transition-all duration-200 aspect-square hover:-translate-y-0.5 hover:border-accent/45 hover:bg-surface-light hover:shadow-[0_0_28px_rgba(6,182,212,0.18)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 p-3 shadow-[0_0_28px_rgba(6,182,212,0.14)]">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-lg font-bold text-foreground">Mis Stickers</div>
                  <div className="mt-1 text-sm text-white/60">Crea y gestiona tu catálogo</div>
                </div>
                <div className="text-sm font-semibold text-white/70 group-hover:text-white">Entrar →</div>
              </div>
            </Link>

            <Link
              href="/dashboard/reviews"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-5 transition-all duration-200 aspect-square hover:-translate-y-0.5 hover:border-secondary/45 hover:bg-surface-light hover:shadow-[0_0_28px_rgba(236,72,153,0.16)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/18 via-transparent to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-secondary/25 bg-secondary/10 p-3 shadow-[0_0_28px_rgba(236,72,153,0.14)]">
                    <Star className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="text-lg font-bold text-foreground">Mis reseñas</div>
                  <div className="mt-1 text-sm text-white/60">Gestiona tus opiniones</div>
                </div>
                <div className="text-sm font-semibold text-white/70 group-hover:text-white">Entrar →</div>
              </div>
            </Link>

            <Link
              href="/dashboard/profile"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-5 transition-all duration-200 aspect-square hover:-translate-y-0.5 hover:border-white/25 hover:bg-surface-light hover:shadow-[0_0_28px_rgba(255,255,255,0.06)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_0_28px_rgba(255,255,255,0.05)]">
                    <User className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="text-lg font-bold text-foreground">Cuenta</div>
                  <div className="mt-1 text-sm text-white/60">Perfil y seguridad</div>
                </div>
                <div className="text-sm font-semibold text-white/70 group-hover:text-white">Entrar →</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
