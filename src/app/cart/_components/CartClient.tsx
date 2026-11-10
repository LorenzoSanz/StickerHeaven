"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CartDTO } from "@/modules/Cart/public";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";
import { clearCartAction, removeItem, updateItemQuantity } from "../actions";
import { ClearCartButton } from "./ClearCartButton";
import { CartItemControls } from "./CartItemControls";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

type CartItemUI = CartDTO["items"][number] & {
  isUpdating: boolean;
  isRemoving: boolean;
  bumpToken: number;
};

function computeCartTotalAmount(items: Array<CartDTO["items"][number]>) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CartClient({ initialCart }: { initialCart: CartDTO | null }) {
  const notifications = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [items, setItems] = useState<CartItemUI[]>(
    initialCart?.items.map((item) => ({
      ...item,
      isUpdating: false,
      isRemoving: false,
      bumpToken: 0,
    })) ?? []
  );

  const currency = initialCart?.currency ?? items[0]?.currency ?? "EUR";
  const totalAmount = useMemo(() => computeCartTotalAmount(items), [items]);
  const isEmpty = items.length === 0;

  const bumpItem = (stickerId: string) => {
    setItems((current) =>
      current.map((it) => (it.stickerId === stickerId ? { ...it, bumpToken: it.bumpToken + 1 } : it))
    );
  };

  const setItem = (stickerId: string, updater: (it: CartItemUI) => CartItemUI) => {
    setItems((current) => current.map((it) => (it.stickerId === stickerId ? updater(it) : it)));
  };

  const handleUpdate = async (stickerId: string, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    setError(null);

    let previousQuantity: number | null = null;

    setItem(stickerId, (it) => {
      previousQuantity = it.quantity;
      return {
        ...it,
        quantity: nextQuantity,
        total: it.price * nextQuantity,
        isUpdating: true,
      };
    });

    bumpItem(stickerId);

    try {
      await updateItemQuantity(stickerId, nextQuantity);
    } catch {
      setError("No se pudo actualizar la cantidad. Inténtalo de nuevo.");
      if (previousQuantity !== null) {
        setItem(stickerId, (it) => ({
          ...it,
          quantity: previousQuantity ?? it.quantity,
          total: it.price * (previousQuantity ?? it.quantity),
        }));
      }
    } finally {
      setItem(stickerId, (it) => ({ ...it, isUpdating: false }));
    }
  };

  const handleRemove = async (stickerId: string) => {
    setError(null);

    const itemName = items.find((it) => it.stickerId === stickerId)?.stickerName ?? "este artículo";
    const ok = await notifications.confirm({
      variant: "danger",
      title: "Eliminar del carrito",
      message: `¿Seguro que quieres eliminar ${itemName} del carrito?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
    });
    if (!ok) return;

    setItem(stickerId, (it) => ({ ...it, isRemoving: true, isUpdating: true }));
    await sleep(220);

    try {
      await removeItem(stickerId);
      setItems((current) => current.filter((it) => it.stickerId !== stickerId));
      notifications.notify({ variant: "success", title: "Artículo eliminado", message: "Se eliminó del carrito correctamente." });
    } catch {
      setError("No se pudo eliminar el artículo. Inténtalo de nuevo.");
      notifications.notify({ variant: "danger", title: "No se pudo eliminar", message: "Inténtalo de nuevo." });
      setItem(stickerId, (it) => ({ ...it, isRemoving: false }));
    } finally {
      setItem(stickerId, (it) => ({ ...it, isUpdating: false }));
    }
  };

  const handleClear = async () => {
    if (isClearing) return;
    setError(null);

    const ok = await notifications.confirm({
      variant: "danger",
      title: "Vaciar carrito",
      message: "Se eliminarán todos los artículos del carrito. Esta acción no se puede deshacer.",
      confirmLabel: "Vaciar",
      cancelLabel: "Cancelar",
    });
    if (!ok) return;

    const snapshot = items.map((it) => ({ ...it }));

    setIsClearing(true);
    setItems((current) => current.map((it) => ({ ...it, isUpdating: true, isRemoving: true })));
    await sleep(240);

    try {
      const result = await clearCartAction();
      if (result.error) {
        throw new Error(result.error);
      }
      setItems([]);
      notifications.notify({ variant: "success", title: "Carrito vacío", message: "Tu carrito se vació correctamente." });
    } catch (e) {
      setItems(snapshot.map((it) => ({ ...it, isUpdating: false, isRemoving: false })));
      notifications.notify({
        variant: "danger",
        title: "No se pudo vaciar el carrito",
        message: e instanceof Error ? e.message : "Inténtalo de nuevo.",
      });
      throw e;
    } finally {
      setIsClearing(false);
    }
  };

  if (isEmpty) {
    return (
      <Card className="p-10 text-center">
        <p className="text-lg text-white/70">Tu carrito está vacío.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/stickers">
            <Button
              className="rounded-full transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none"
              size="lg"
            >
              Ver stickers
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {error ? <Alert variant="danger">{error}</Alert> : null}

        {items.map((item) => (
          <div
            key={item.stickerId}
            className={[
              "overflow-hidden transition-[max-height,margin,padding] duration-200 ease-out",
              item.isRemoving ? "max-h-0 -mb-4 pt-0" : "max-h-[280px] pt-1",
            ].join(" ")}
          >
            <Card
              className={[
                "p-4 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.10)]",
                "motion-reduce:transform-none",
                item.isRemoving ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100",
              ].join(" ")}
            >
              <div className="flex gap-4">
                <div className="relative h-24 w-24 rounded-lg overflow-hidden flex items-center justify-center border border-white/10 bg-white/5 text-white/40">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.stickerName ?? "Sticker"}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs">Sin imagen</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-lg text-foreground">
                        {item.stickerName ?? `Sticker ${item.stickerId}`}
                      </h3>
                      <p className="mt-0.5 text-sm text-white/60">
                        Precio unitario: {formatCurrency(item.price, item.currency)}
                      </p>
                    </div>
                    <div
                      key={item.bumpToken}
                      className="shrink-0 text-lg font-bold text-foreground animate-bump motion-reduce:animate-none"
                    >
                      {formatCurrency(item.total, item.currency)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <CartItemControls
                      quantity={item.quantity}
                      isUpdating={item.isUpdating}
                      bumpToken={item.bumpToken}
                      onUpdateQuantity={(nextQuantity) => handleUpdate(item.stickerId, nextQuantity)}
                      onRemove={() => handleRemove(item.stickerId)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Card className="h-fit p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Resumen</h2>
        <div className="flex justify-between mb-2 text-white/70">
          <span>Subtotal</span>
          <span key={items.length} className="font-medium text-foreground animate-bump motion-reduce:animate-none">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>
        <div className="flex justify-between mb-4 text-white/70">
          <span>Envío</span>
          <span className="font-medium text-foreground">Gratis</span>
        </div>
        <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl mb-6">
          <span>Total</span>
          <span key={Math.round(totalAmount * 100)} className="animate-bump motion-reduce:animate-none">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>

        <Link href="/checkout" className="block">
          <Button
            className="w-full rounded-full transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:scale-[1.01] active:scale-[0.98] motion-reduce:transform-none"
            size="lg"
          >
            Ir a pagar
          </Button>
        </Link>

        <div className="mt-3">
          <ClearCartButton onClear={handleClear} disabled={isClearing} />
        </div>
      </Card>
    </div>
  );
}
