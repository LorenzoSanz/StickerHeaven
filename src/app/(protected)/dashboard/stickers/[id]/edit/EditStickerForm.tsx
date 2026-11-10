"use client";

// POR QUÉ: React 19 renombró useFormState a useActionState; mantiene el submit de server actions sin warnings.
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { updateSticker } from "./actions";
import type { StickerDTO } from "@/modules/Catalog/public";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TagSelector } from "../../_components/TagSelector";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : "Guardar cambios"}
    </Button>
  );
}

export function EditStickerForm({ sticker }: { sticker: StickerDTO }) {
  const [state, action] = useActionState(updateSticker, null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // POR QUÉ: Con Server Actions, React gestiona automáticamente method/enctype; declararlos manualmente provoca warnings en consola.
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="stickerId" value={sticker.id} />

      {state?.error && (
        <Alert variant="danger" role="alert" aria-live="polite">
          {state.error}
        </Alert>
      )}

      <div>
        <label htmlFor="edit-sticker-name" className="block text-sm font-medium text-white/80">
          Nombre
        </label>
        <Input
          id="edit-sticker-name"
          name="name"
          required
          defaultValue={sticker.name}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="edit-sticker-description" className="block text-sm font-medium text-white/80">
          Descripción
        </label>
        <textarea
          id="edit-sticker-description"
          name="description"
          required
          defaultValue={sticker.description}
          rows={4}
          className={cn(
            "mt-1 w-full rounded-md border border-white/10 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-white/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="edit-sticker-priceAmount" className="block text-sm font-medium text-white/80">
            Precio
          </label>
          <Input
            id="edit-sticker-priceAmount"
            name="priceAmount"
            type="number"
            step="any"
            min="0"
            required
            defaultValue={String(sticker.price.amount)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="edit-sticker-priceCurrency" className="block text-sm font-medium text-white/80">
            Moneda
          </label>
          <Select
            id="edit-sticker-priceCurrency"
            name="priceCurrency"
            required
            defaultValue={sticker.price.currency}
            className="mt-1"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </Select>
        </div>

        <div>
          <label htmlFor="edit-sticker-stock" className="block text-sm font-medium text-white/80">
            Stock
          </label>
          <Input
            id="edit-sticker-stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={String(sticker.stock)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          Categorías (Tags)
        </label>
        <TagSelector initialTags={sticker.tags} />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80">Imagen</label>
        <div className="mt-2 flex items-start gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-surface">
            <Image
              src={sticker.imageUrl}
              alt={sticker.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragDepth.current += 1;
                setIsDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) setIsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragDepth.current = 0;
                setIsDragActive(false);
                const file = e.dataTransfer.files?.[0] ?? null;
                if (!file) return;
                if (!file.type.startsWith("image/")) return;
                if (!fileInputRef.current) return;
                try {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  fileInputRef.current.files = dt.files;
                  if (fileInputRef.current.files?.length) setSelectedImageName(file.name);
                } catch {}
              }}
              className={cn(
                "rounded-xl border border-dashed p-3 transition-all",
                "bg-white/5 border-white/10",
                "focus-within:ring-2 focus-within:ring-primary",
                isDragActive ? "border-primary/50 bg-primary/10 shadow-[0_0_28px_rgba(139,92,246,0.14)]" : "hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="edit-sticker-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setSelectedImageName(e.currentTarget.files?.[0]?.name ?? null)}
                />
                <label
                  htmlFor="edit-sticker-image"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                    "border-white/10 bg-white/5 text-foreground hover:bg-white/10",
                    isDragActive ? "border-primary/30 bg-primary/10" : ""
                  )}
                >
                  Cambiar imagen
                </label>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white/70">
                    {selectedImageName ?? "Arrastra una imagen aquí o mantén la actual"}
                  </div>
                  <div className="mt-0.5 text-xs text-white/40">
                    {isDragActive ? "Suelta la imagen para adjuntarla" : "Deja vacío para mantener la imagen actual"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
