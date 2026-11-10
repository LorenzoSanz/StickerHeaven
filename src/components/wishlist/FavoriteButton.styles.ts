import { cn } from "@/lib/utils";

export function getFavoriteButtonClassName({ active }: { active: boolean }) {
  // El icono debe quedar perfectamente centrado dentro del botón circular en todas las combinaciones de estilos.
  // Utiliza layout grid (place-items-center) para centrar de forma robusta, manteniendo los hovers existentes.
  return cn(
    "grid place-items-center h-9 w-9 rounded-full border border-white/10 bg-black/40 backdrop-blur-md",
    "text-white/80 hover:text-white hover:border-white/20 hover:bg-black/55",
    "transition-all active:scale-95",
    active ? "shadow-[0_0_18px_rgba(236,72,153,0.35)]" : ""
  );
}

export function getFavoriteIconClassName({ active }: { active: boolean }) {
  // El icono no debe encoger ni provocar saltos visuales durante hover/animaciones del contenedor.
  // Fija tamaño y evita shrink; colorea según estado activo/inactivo.
  return cn("block h-[18px] w-[18px] shrink-0", active ? "text-pink-400" : "text-white/75");
}
