/**
 * Dividir el control de precio en 2 sliders reduce complejidad y evita bugs del rango dual.
 * Provee un slider de un solo thumb
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (next: number) => void;
  className?: string;
  ariaLabel: string;
};

/**
 * Dividir el control de precio en 2 sliders reduce complejidad y evita bugs del rango dual. 
 * Me rindo no vale la pena
 * Provee un slider de un solo thumb
 */
export function SingleSlider({ min, max, step = 1, value, onValueChange, className, ariaLabel }: Props) {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = React.useRef<number | null>(null);

  const clamp = React.useCallback((n: number, low: number, high: number) => Math.min(high, Math.max(low, n)), []);

  const snapToStep = React.useCallback(
    (n: number) => {
      if (!Number.isFinite(step) || step <= 0) return n;
      const snapped = Math.round((n - min) / step) * step + min;
      const digits = step % 1 === 0 ? 0 : String(step).split(".")[1]?.length ?? 2;
      return Number(snapped.toFixed(digits));
    },
    [min, step]
  );
  // Convierte una coordenada X en el rango del track en un valor de precio válido.
  // Asegura que el valor esté dentro del rango y se ajuste al paso.
  const valueFromClientX = React.useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return value;
      const rect = el.getBoundingClientRect();
      const pct = rect.width <= 0 ? 0 : (clientX - rect.left) / rect.width;
      const raw = min + pct * (max - min);
      return clamp(snapToStep(raw), min, max);
    },
    [clamp, max, min, snapToStep, value]
  );
  // Calcula el porcentaje de posición del valor actual en el rango del track.
  // Utilizado para posicionar el thumb en el track.
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="relative h-11 rounded-xl border border-white/10 bg-surface-highlight/40 px-3 shadow-[0_0_24px_rgba(0,0,0,0.22)]"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement | null)?.closest?.('button[role=\"slider\"]')) return;
          activePointerIdRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          onValueChange(valueFromClientX(e.clientX));
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          if (activePointerIdRef.current !== e.pointerId) return;
          onValueChange(valueFromClientX(e.clientX));
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          activePointerIdRef.current = null;
        }}
        onPointerCancel={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          activePointerIdRef.current = null;
        }}
      >
        <div ref={trackRef} className="absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-primary/70 to-accent/40 shadow-[0_0_18px_rgba(139,92,246,0.28)]"
            style={{ left: "0%", width: `${pct}%` }}
          />
        </div>

        <button
          type="button"
          role="slider"
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
          onPointerDown={(e) => {
            e.stopPropagation();
            activePointerIdRef.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            onValueChange(valueFromClientX(e.clientX));
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            if (activePointerIdRef.current !== e.pointerId) return;
            onValueChange(valueFromClientX(e.clientX));
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            activePointerIdRef.current = null;
          }}
          onPointerCancel={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            activePointerIdRef.current = null;
          }}
          onKeyDown={(e) => {
            const delta = step > 0 ? step : 1;
            const isLeft = e.key === "ArrowLeft" || e.key === "ArrowDown";
            const isRight = e.key === "ArrowRight" || e.key === "ArrowUp";
            if (!isLeft && !isRight && e.key !== "Home" && e.key !== "End") return;
            e.preventDefault();

            let next = value;
            if (e.key === "Home") next = min;
            else if (e.key === "End") next = max;
            else next = clamp(value + (isRight ? delta : -delta), min, max);
            onValueChange(next);
          }}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 touch-none select-none",
            "h-5 w-5 rounded-full border border-white/25 bg-white/95 shadow-[0_0_24px_rgba(0,0,0,0.45)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-20"
          )}
          style={{ left: `calc(0.75rem + (100% - 1.5rem) * ${pct / 100})` }}
        />
      </div>
    </div>
  );
}
