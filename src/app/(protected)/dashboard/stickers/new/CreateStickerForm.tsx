"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";
import { flashNotify } from "@/components/notifications/flashNotify";
import { TagSelector } from "../_components/TagSelector";

// Formulario para crear un nuevo sticker.
export function CreateStickerForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [droppedImageFile, setDroppedImageFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resolvedImageName = useMemo(() => {
    return droppedImageFile?.name ?? selectedImageName;
  }, [droppedImageFile?.name, selectedImageName]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const imageFromInput = formData.get("image");
    const hasInputImage = imageFromInput instanceof File && imageFromInput.size > 0;
    if (!hasInputImage && droppedImageFile) {
      formData.set("image", droppedImageFile);
    }
    const finalImage = formData.get("image");
    const hasFinalImage = finalImage instanceof File && finalImage.size > 0;
    if (!hasFinalImage) {
      setError("Selecciona o arrastra una imagen para el sticker.");
      return;
    }
    setIsPending(true);

    try {
      const res = await fetch("/api/stickers", { method: "POST", body: formData });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      flashNotify({ variant: "success", title: "Sticker creado", message: "Se subió correctamente." });
      router.push("/stickers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el sticker");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-4">
      <div>
        <label htmlFor="sticker-name" className="block text-sm font-medium text-white/80">
          Nombre
        </label>
        <Input
          id="sticker-name"
          name="name"
          required
          className="mt-1"
          placeholder="Nombre del sticker"
        />
      </div>

      <div>
        <label htmlFor="sticker-description" className="block text-sm font-medium text-white/80">
          Descripción
        </label>
        <textarea
          id="sticker-description"
          name="description"
          className={cn(
            "mt-1 w-full rounded-md border border-white/10 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-white/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          rows={3}
          placeholder="Descripción opcional"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="sticker-priceAmount" className="block text-sm font-medium text-white/80">
            Precio
          </label>
          <Input
            id="sticker-priceAmount"
            name="priceAmount"
            type="number"
            step="any"
            min="0"
            required
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="sticker-priceCurrency" className="block text-sm font-medium text-white/80">
            Moneda
          </label>
          <Select
            id="sticker-priceCurrency"
            name="priceCurrency"
            required
            defaultValue="EUR"
            className="mt-1"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </Select>
        </div>

        <div>
          <label htmlFor="sticker-stock" className="block text-sm font-medium text-white/80">
            Stock
          </label>
          <Input
            id="sticker-stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            required
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          Categorías (Tags)
        </label>
        <TagSelector />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80">Imagen</label>
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
            if (!file.type.startsWith("image/")) {
              setError("El archivo debe ser una imagen.");
              return;
            }
            setDroppedImageFile(file);
            setSelectedImageName(file.name);
            if (!fileInputRef.current) return;
            try {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
            } catch {}
          }}
          className={cn(
            "mt-2 rounded-xl border border-dashed p-3 transition-all",
            "bg-white/5 border-white/10",
            "focus-within:ring-2 focus-within:ring-primary",
            isDragActive
              ? "border-primary/50 bg-primary/10 shadow-[0_0_28px_rgba(139,92,246,0.14)] scale-[1.01]"
              : "hover:bg-white/10"
          )}
        >
          <input
            ref={fileInputRef}
            id="sticker-image"
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const name = e.currentTarget.files?.[0]?.name ?? null;
              setSelectedImageName(name);
              setDroppedImageFile(null);
            }}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label
              htmlFor="sticker-image"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                "border-white/10 bg-white/5 text-foreground hover:bg-white/10",
                isDragActive ? "border-primary/30 bg-primary/10" : ""
              )}
            >
              Seleccionar imagen
            </label>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-white/70">
                {resolvedImageName ?? "Arrastra una imagen aquí o selecciona un archivo"}
              </div>
              <div className="mt-0.5 text-xs text-white/40">
                {isDragActive ? "Suelta la imagen para adjuntarla" : "PNG, JPG o WebP"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" role="alert" aria-live="polite">
          {error}
        </Alert>
      )}

      <div className="flex justify-center pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando…" : "Crear sticker"}
        </Button>
      </div>
    </form>
  );
}
