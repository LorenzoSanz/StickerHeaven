/**
 * PROPÓSITO: Centralizar estilos derivados (Tailwind classes) para filtros de stickers.
 * RESPONSABILIDAD: Garantizar hovers consistentes sin acoplar tests a Next/React hooks.
 * DEPENDENCIAS: Solo utilidades puras (cn).
 * SEGURIDAD/INTEGRIDAD: No aplica (solo presentación).
 * NOTAS: Mantener estas funciones simples para facilitar su eliminación/refactor.
 */
import { cn } from "@/lib/utils";

export function getFilterChevronClassName() {
  // POR QUÉ: El chevron debe reaccionar al hover del summary para dar feedback claro de interacción.
  // QUÉ: Añade estilos con group-hover para cambiar fondo/borde/texto del contenedor circular.
  return cn(
    "h-7 w-7 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/60 transition-all group-open:rotate-180",
    "group-hover:border-primary/30 group-hover:bg-white/10 group-hover:text-white/80"
  );
}

export function getTagOptionButtonClassName({ active }: { active: boolean }) {
  // POR QUÉ: Los tags deben indicar claramente que son interactivos (hover) y mantener el estado activo al pasar el ratón.
  // QUÉ: Aplica hover sutil a inactivos y hover morado a activos sin perder contraste en dark UI.
  return cn(
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
    active
      ? "border-primary/40 bg-primary/15 text-white shadow-[0_0_18px_rgba(139,92,246,0.18)] hover:bg-primary/20 hover:border-primary/50"
      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-primary/30 hover:text-white/85"
  );
}

export function getSortOptionButtonClassName({ active }: { active: boolean }) {
  // POR QUÉ: En hover, un filtro seleccionado no debe parecer deseleccionado.
  // QUÉ: Separa los estilos hover por estado para preservar el aspecto de selección.
  return cn(
    "w-full rounded-2xl border px-4 py-3 text-left transition-all",
    active
      ? "border-primary/40 bg-primary/15 shadow-[0_0_18px_rgba(139,92,246,0.18)] hover:bg-primary/20 hover:border-primary/50"
      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
  );
}
