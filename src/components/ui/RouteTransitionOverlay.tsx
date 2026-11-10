"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  routeKey: string;
  minDurationMs?: number;
  title?: string;
  subtitle?: string;
};
// Componente para mostrar un overlay de transición de rutas con un mensaje y opcionalmente un subtítulo.
// Utiliza un efecto para activar y desactivar el overlay después de una duración mínima.
export function RouteTransitionOverlay({
  routeKey,
  minDurationMs = 1500,
  title = "Cargando",
  subtitle = "Preparando tu experiencia…",
}: Props) {
  const firstRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => setActive(true));
    timerRef.current = window.setTimeout(() => setActive(false), minDurationMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [minDurationMs, routeKey]);

  return (
    <div
      className={[
        "route-loader-overlay fixed inset-0 z-[60]",
        "text-white",
        "bg-black/50",
        "supports-[backdrop-filter]:bg-black/20 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150",
        "transition-opacity duration-200 ease-out",
        active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
      aria-hidden={!active}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] h-[520px] w-[520px] rounded-full bg-primary/15 blur-[140px] opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[520px] w-[520px] rounded-full bg-accent/15 blur-[140px] opacity-25" />
      </div>

      <div className="relative z-10 flex min-h-[100vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-surface/70 p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-white/6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
          </div>
          <div className="text-lg font-semibold text-foreground">{title}</div>
          {subtitle ? <div className="mt-2 text-sm text-white/60">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
}
