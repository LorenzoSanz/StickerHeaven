/**
 * PROPÓSITO: Botón cliente para añadir un sticker al carrito vía la API de carrito.
 * RESPONSABILIDAD: Llama a /api/cart/items y ofrece feedback (cargando/error).
 * DEPENDENCIAS: Usa las acciones existentes del carrito.
 * SEGURIDAD/INTEGRIDAD: Depende de cookies HttpOnly; no expone datos sensibles.
 * NOTAS: Intencionalmente simple; se puede ampliar con más UX y analítica.
 */

"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { addItemToCartAction } from "@/app/cart/actions";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type AddToCartButtonProps = {
  stickerId: string;
  quantity?: number;
  disabled?: boolean;
  title?: string;
  className?: string;
  iconOnly?: boolean;
};

// Botón para añadir un sticker al carrito.
export function AddToCartButton({
  stickerId,
  quantity = 1,
  disabled,
  title = "Añadir al carrito",
  className,
  iconOnly = false,
}: AddToCartButtonProps) {
  // Añade un sticker al carrito.
  const { notify } = useNotifications();
  const [isPending, setIsPending] = useState(false);
  // Maneja el clic en el botón.
  const onClick = async () => {
    if (disabled || isPending) return;
    setIsPending(true);
    try {
      const result = await addItemToCartAction(stickerId, quantity);
      if (result.error) {
        throw new Error(result.error);
      }
      notify({
        variant: "success",
        title: "Añadido al carrito",
        message: "Tu sticker ya está en el carrito.",
      });
    } catch (e) {
      notify({
        variant: "danger",
        title: "No se pudo añadir al carrito",
        message: e instanceof Error ? e.message : "Inténtalo de nuevo.",
      });
    } finally {
      setIsPending(false);
    }
  };
  // Renderiza el botón.
  return (
    <div className="flex flex-col items-stretch">
      <Button
        onClick={onClick}
        disabled={disabled || isPending}
        title={title}
        aria-label={iconOnly ? title : undefined}
        className={
          className ??
          "rounded-full transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none"
        }
      >
        {/* Spinner del carrito */}
        {isPending ? <Spinner size="sm" className="text-white drop-shadow-none" /> : <ShoppingCart size={18} />}
        {iconOnly ? <span className="sr-only">{title}</span> : null}
        {!iconOnly && (isPending ? "Añadiendo…" : "Añadir al carrito")}
      </Button>
    </div>
  );
}
