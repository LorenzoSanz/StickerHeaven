/**
 * Para un modal consistente (estilo + accesibilidad básica) para confirmaciones y avisos importantes.
 * Provee un contenedor modal con cierre por ESC, bloqueo de scroll y gestión de foco.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  descriptionId?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
};

// Función para obtener elementos enfocables dentro de un contenedor.
// Estos elementos pueden recibir foco y ser interactivos.
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

// Componente para mostrar un modal con diferentes tamaños y estilos.
// Proporciona funcionalidades como cierre por ESC, bloqueo de scroll y gestión de foco.
export function Modal({
  open,
  onClose,
  titleId,
  descriptionId,
  size = "md",
  closeOnBackdrop = true,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  
  // Clase de tamaño para el panel modal basada en el tamaño especificado.
  const panelSizeClass = useMemo(() => {
    const sizes: Record<ModalSize, string> = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
    };
    return sizes[size];
  }, [size]);
  // Efecto para manejar la apertura y cierre del modal.
  // Renderiza el modal cuando se abra y lo oculta cuando se cierre.
  useEffect(() => {
    if (open) {
      const raf = window.requestAnimationFrame(() => {
        setShouldRender(true);
        setIsClosing(false);
      });
      return () => window.cancelAnimationFrame(raf);
    }
    if (!shouldRender) return;
    const raf = window.requestAnimationFrame(() => setIsClosing(true));
    const t = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, 170);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [open, shouldRender]);
  // Efecto para manejar la gestión de foco cuando se abre o cierra el modal.
  // Guarda y restaura el foco anterior para una mejor accesibilidad.
  useEffect(() => {
    if (!shouldRender) return;
    if (typeof document === "undefined") return;

    previousFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    if (panel) {
      const focusables = getFocusableElements(panel);
      (focusables[0] ?? panel).focus();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
      previousFocusRef.current = null;
    };
  }, [shouldRender]);
  // Efecto para manejar el cierre del modal cuando se presiona la tecla ESC.
  // Previene el comportamiento predeterminado y llama a onClose.
  useEffect(() => {
    if (!shouldRender) return;
    if (typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusables = getFocusableElements(panel);
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm",
          isClosing ? "animate-fade-out" : "animate-fade-in",
          "motion-reduce:animate-none"
        )}
        onMouseDown={() => {
          if (closeOnBackdrop) onClose();
        }}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          "relative w-full",
          panelSizeClass,
          "rounded-2xl border border-white/10 bg-surface/95 shadow-[0_0_60px_rgba(0,0,0,0.55)]",
          "ring-1 ring-primary/10",
          isClosing ? "animate-modal-out" : "animate-modal-in",
          "motion-reduce:animate-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}
