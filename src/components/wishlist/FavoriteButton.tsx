"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWishlist } from "./useWishlist";
import { getFavoriteButtonClassName, getFavoriteIconClassName } from "./FavoriteButton.styles";

type Props = {
  stickerId: string;
  userId?: string | null;
  className?: string;
};

/**
 * Botón de favoritos para stickers.
 * El icono debe quedar centrado dentro del botón circular y mantener feedback en hover/active.
 */
export function FavoriteButton({ stickerId, userId, className }: Props) {
  const router = useRouter();
  const storageKey = userId ? `wishlist_sticker_ids:${userId}` : "wishlist_sticker_ids:disabled";
  const { isFavorite, toggle } = useWishlist({ storageKey });
  const active = isFavorite(stickerId);

  // El icono debe quedar centrado dentro del botón circular y mantener feedback en hover/active.
  // Centraliza las clases en helpers puros y usa layout grid para centrado robusto.
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      onClick={() => {
        // Favoritos debe ser una acción privada asociada a usuario, no disponible para invitados.
        // Redirige a login si no hay userId; si lo hay, usa storage aislado por usuario.
        if (!userId) {
          router.push("/login");
          return;
        }
        toggle(stickerId);
      }}
      className={cn(getFavoriteButtonClassName({ active }), className)}
    >
      <Heart
        className={getFavoriteIconClassName({ active })}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      />
    </button>
  );
}
