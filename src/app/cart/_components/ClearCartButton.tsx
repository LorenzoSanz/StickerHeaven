"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearCartAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

export function ClearCartButton({
  onClear,
  disabled,
}: {
  onClear?: () => Promise<void>;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { notify } = useNotifications();
  const [isPending, setIsPending] = useState(false);

  const runClear = async () => {
    setIsPending(true);
    try {
      if (onClear) {
        await onClear();
      } else {
        const result = await clearCartAction();
        if (result.error) throw new Error(result.error);
        router.refresh();
      }
    } catch (e) {
      if (!onClear) {
        notify({
          variant: "danger",
          title: "No se pudo vaciar el carrito",
          message: e instanceof Error ? e.message : "Inténtalo de nuevo.",
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full transition-all hover:border-primary/40 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(139,92,246,0.15)] hover:scale-[1.01] active:scale-[0.98] motion-reduce:transform-none"
      onClick={runClear}
      disabled={isPending || disabled}
    >
      {isPending ? "Vaciando..." : "Vaciar carrito"}
    </Button>
  );
}
