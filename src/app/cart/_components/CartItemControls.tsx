"use client";

import { useEffect, useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function CartItemControls({
  quantity,
  isUpdating,
  bumpToken,
  onUpdateQuantity,
  onRemove,
}: {
  quantity: number;
  isUpdating: boolean;
  bumpToken: number;
  onUpdateQuantity: (nextQuantity: number) => void;
  onRemove: () => void;
}) {
  const [draftQuantity, setDraftQuantity] = useState<string>(String(quantity));

  useEffect(() => {
    setDraftQuantity(String(quantity));
  }, [quantity]);

  const commitDraft = (nextRaw: string) => {
    const trimmed = nextRaw.trim();
    if (!trimmed) {
      setDraftQuantity(String(quantity));
      return;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed)) {
      setDraftQuantity(String(quantity));
      return;
    }

    const next = Math.max(1, parsed);
    setDraftQuantity(String(next));
    if (next !== quantity) onUpdateQuantity(next);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-white/10 bg-white/5">
          <button
            type="button"
            onClick={() => onUpdateQuantity(quantity - 1)}
            disabled={isUpdating || quantity <= 1}
            className="rounded-full p-2 text-white/80 transition-all hover:bg-primary/10 hover:text-white active:scale-[0.96] disabled:opacity-40 motion-reduce:transform-none"
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="w-12 h-9 grid place-items-center text-sm font-semibold text-foreground">
            {isUpdating ? (
              <Spinner size="sm" className="mx-auto text-white/70 drop-shadow-none" />
            ) : (
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={draftQuantity}
                onChange={(e) => setDraftQuantity(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  commitDraft(e.currentTarget.value);
                  e.currentTarget.blur();
                }}
                onBlur={(e) => commitDraft(e.currentTarget.value)}
                aria-label="Cantidad"
                className="h-9 w-12 bg-transparent p-0 text-center text-sm font-semibold leading-[2.25rem] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => onUpdateQuantity(quantity + 1)}
            disabled={isUpdating}
            className="rounded-full p-2 text-white/80 transition-all hover:bg-primary/10 hover:text-white active:scale-[0.96] disabled:opacity-40 motion-reduce:transform-none"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={isUpdating}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-white active:scale-[0.98] disabled:opacity-40 motion-reduce:transform-none"
        aria-label="Eliminar producto"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </button>
    </div>
  );
}
