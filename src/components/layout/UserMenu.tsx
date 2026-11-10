"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { flashNotify } from "@/components/notifications/flashNotify";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingRefreshPathname, setPendingRefreshPathname] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const initial = useMemo(() => {
    const source = (name || email || "").trim();
    const c = source[0] ?? "U";
    return c.toUpperCase();
  }, [email, name]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setEntered(false);
      return;
    }
    if (!shouldRender) return;
    setEntered(false);
    const t = window.setTimeout(() => {
      setShouldRender(false);
    }, 170);
    return () => window.clearTimeout(t);
  }, [open, shouldRender]);

  useEffect(() => {
    if (!shouldRender || !open) return;
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, [open, shouldRender]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node | null;
      if (target && root.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!pendingRefreshPathname) return;
    if (pathname !== pendingRefreshPathname) return;
    router.refresh();
    setPendingRefreshPathname(null);
  }, [pathname, pendingRefreshPathname, router]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) {
              setShouldRender(true);
              setEntered(false);
            }
            return next;
          });
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "h-10 w-10 rounded-full grid place-items-center",
          "border border-white/10 bg-white/5 text-white/85 font-bold",
          "transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-white",
          "hover:shadow-[0_0_18px_rgba(139,92,246,0.25)] active:scale-[0.98] motion-reduce:transform-none"
        )}
      >
        <span className="leading-none">{initial}</span>
      </button>

      {shouldRender ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-12 z-50 w-[280px] origin-top-right",
            "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-[0.985] pointer-events-none"
          )}
        >
          <div className="rounded-2xl border border-white/10 bg-surface/95 shadow-[0_0_60px_rgba(0,0,0,0.55)] ring-1 ring-primary/10 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
              <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/90 font-bold">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{name || "Cuenta"}</div>
                <div className="text-xs text-white/60 truncate">{email}</div>
              </div>
            </div>

            <div className="p-2">
              <div className="space-y-1">
                <Link
                  role="menuitem"
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5",
                    "text-sm font-semibold text-white/80 transition-all",
                    "hover:bg-primary/10 hover:border-primary/35 hover:text-white",
                    "hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]"
                  )}
                >
                  Panel de Control
                  <span className="text-white/35">→</span>
                </Link>

                <Link
                  role="menuitem"
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5",
                    "text-sm font-semibold text-white/80 transition-all",
                    "hover:bg-primary/10 hover:border-primary/35 hover:text-white",
                    "hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]"
                  )}
                >
                  Cuenta
                  <span className="text-white/35">→</span>
                </Link>

                <Link
                  role="menuitem"
                  href="/dashboard/stickers"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5",
                    "text-sm font-semibold text-white/80 transition-all",
                    "hover:bg-primary/10 hover:border-primary/35 hover:text-white",
                    "hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]"
                  )}
                >
                  Mis stickers
                  <span className="text-white/35">→</span>
                </Link>

                <Link
                  role="menuitem"
                  href="/dashboard/orders"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5",
                    "text-sm font-semibold text-white/80 transition-all",
                    "hover:bg-primary/10 hover:border-primary/35 hover:text-white",
                    "hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]"
                  )}
                >
                  Pedidos
                  <span className="text-white/35">→</span>
                </Link>

                <button
                  role="menuitem"
                  type="button"
                  onClick={async () => {
                    if (isLoggingOut) return;
                    setIsLoggingOut(true);
                    try {
                      const result = await logoutAction();
                      if (result.error) {
                        notifications.notify({ variant: "danger", title: "No se pudo cerrar sesión", message: result.error });
                        return;
                      }
                      flashNotify({ variant: "info", title: "Sesión cerrada", message: "Has salido correctamente." });
                      setOpen(false);
                      setPendingRefreshPathname("/");
                      router.push("/");
                    } finally {
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5",
                    "text-sm font-semibold text-red-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed",
                    "hover:bg-red-500/10 hover:border-red-400/35 hover:text-red-200",
                    "hover:shadow-[0_0_16px_rgba(239,68,68,0.18)]"
                  )}
                >
                  {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                  <span className="text-red-300/50">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
