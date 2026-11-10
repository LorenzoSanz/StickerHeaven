"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { StickerDTO } from "@/modules/Catalog/public";
import { useWishlist } from "@/components/wishlist/useWishlist";
import { FavoriteButton } from "@/components/wishlist/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

// Componente cliente para la lista de favs del usuario.
export function WishlistClient({ userId }: { userId: string }) {
  const { ids, hydrated, clear } = useWishlist({ storageKey: `wishlist_sticker_ids:${userId}` });
  const [items, setItems] = useState<StickerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  // POR QUÉ: Evitar que fallos de red disparen error boundaries repetidamente y llenen la consola de logs.
  // QUÉ: Captura errores en estado local y muestra un fallback con reintento.
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const sortedIds = useMemo(() => [...ids].sort(), [ids]);

  const skeleton = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="relative flex flex-col gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 overflow-hidden animate-pulse"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-primary/10" />
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/5" />
          <div className="relative flex items-start justify-between gap-2">
            <div className="h-5 w-2/3 rounded-md bg-white/10" />
            <div className="h-6 w-16 rounded-md bg-white/10" />
          </div>
          <div className="relative space-y-2">
            <div className="h-4 w-full rounded-md bg-white/10" />
            <div className="h-4 w-5/6 rounded-md bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const isAbortError = (err: unknown) =>
      Boolean(err && typeof err === "object" && "name" in err && (err as { name?: unknown }).name === "AbortError");

    async function run() {
      if (sortedIds.length === 0) {
        setItems([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled(
          sortedIds.map(async (id) => {
            const res = await fetch(`/api/stickers/${encodeURIComponent(id)}`, { signal: ac.signal });
            if (!res.ok) return null;
            return (await res.json()) as StickerDTO;
          })
        );
        if (!cancelled) {
          setItems(
            results
              .map((r) => (r.status === "fulfilled" ? r.value : null))
              .filter((x): x is StickerDTO => Boolean(x))
          );
        }
      } catch (err) {
        if (cancelled || ac.signal.aborted || isAbortError(err)) return;
        if (!cancelled) setError("No se pudo cargar tu lista de favoritos. Reintenta en unos segundos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (!ac.signal.aborted) ac.abort();
    };
  }, [retryToken, sortedIds]);

  if (!hydrated) {
    return skeleton;
  }

  if (sortedIds.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-white/70 mb-4">No tienes favoritos todavía.</p>
        <Link href="/stickers">
          <Button variant="outline">Explorar catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-white/60 text-sm">{sortedIds.length} guardados</p>
        <Button variant="ghost" onClick={() => clear()}>
          Limpiar todo
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-white/75">{error}</p>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => setRetryToken((v) => v + 1)}>Reintentar</Button>
            <Link href="/stickers">
              <Button variant="outline">Volver al catálogo</Button>
            </Link>
          </div>
        </div>
      ) : loading ? (
        skeleton
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((sticker) => (
            <div
              key={sticker.id}
              className="group relative flex flex-col gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:-translate-y-1"
            >
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton stickerId={sticker.id} userId={userId} />
              </div>

              <Link href={`/stickers/${sticker.id}`} className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center p-4">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                  <Image src={sticker.imageUrl} alt={sticker.name} fill className="object-contain drop-shadow-xl" />
                </div>
              </Link>

              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">
                  {sticker.name}
                </h3>
                <span className="font-bold text-white bg-white/10 px-2 py-1 rounded-md text-sm whitespace-nowrap">
                  {formatCurrency(sticker.price.amount, sticker.price.currency)}
                </span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2 h-10">{sticker.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
