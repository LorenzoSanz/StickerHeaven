"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

// Representa una reseña de un sticker por parte de un usuario.
type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
  authorId?: string;
  authorEmail?: string;
};

type Row = {
  stickerId: string;
  review: Review;
};

type StickerLite = { id: string; name: string };

function readStickerReviews(stickerId: string): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`sticker_reviews_${stickerId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is Review => Boolean(x) && typeof x === "object")
      .map((r) => ({
        id: typeof (r as any).id === "string" ? (r as any).id : "",
        rating: typeof (r as any).rating === "number" ? (r as any).rating : 0,
        comment: typeof (r as any).comment === "string" ? (r as any).comment : "",
        createdAt: typeof (r as any).createdAt === "string" ? (r as any).createdAt : new Date().toISOString(),
        authorName: typeof (r as any).authorName === "string" ? (r as any).authorName : "Anónimo",
        authorId: typeof (r as any).authorId === "string" ? (r as any).authorId : undefined,
        authorEmail: typeof (r as any).authorEmail === "string" ? (r as any).authorEmail : undefined,
      }))
      .map((r, idx) => (r.id ? r : { ...r, id: `${r.createdAt}-${idx}` }))
      .filter((r) => r.rating >= 1 && r.rating <= 5);
  } catch {
    return [];
  }
}

function writeStickerReviews(stickerId: string, reviews: Review[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`sticker_reviews_${stickerId}`, JSON.stringify(reviews));
}

function listStickerIdsWithReviews(): string[] {
  if (typeof window === "undefined") return [];
  const ids: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith("sticker_reviews_")) continue;
    const stickerId = key.replace("sticker_reviews_", "");
    if (stickerId) ids.push(stickerId);
  }
  return ids;
}

// Componente para mostrar y gestionar las reseñas de un usuario.
export function MyReviewsClient({ userId, userEmail }: { userId: string; userEmail: string }) {
  const notifications = useNotifications();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [stickerById, setStickerById] = useState<Record<string, StickerLite>>({});
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);

  const rowsSorted = useMemo(() => {
    return [...rows].sort((a, b) => b.review.createdAt.localeCompare(a.review.createdAt));
  }, [rows]);

  useEffect(() => {
    const stickerIds = listStickerIdsWithReviews();
    const collected: Row[] = [];
    for (const stickerId of stickerIds) {
      const reviews = readStickerReviews(stickerId);
      for (const review of reviews) {
        const isMine = review.authorId === userId || review.authorEmail === userEmail;
        if (!isMine) continue;
        collected.push({ stickerId, review });
      }
    }
    setRows(collected);
    setHydrated(true);
  }, [userEmail, userId]);

  useEffect(() => {
    if (!hydrated) return;
    const stickerIds = Array.from(new Set(rows.map((r) => r.stickerId))).filter((id) => !stickerById[id]);
    if (stickerIds.length === 0) return;

    let cancelled = false;
    const ac = new AbortController();
    async function run() {
      setIsLoadingStickers(true);
      try {
        const results = await Promise.allSettled(
          stickerIds.map(async (id) => {
            const res = await fetch(`/api/stickers/${encodeURIComponent(id)}`, { signal: ac.signal });
            if (!res.ok) return null;
            const data = (await res.json()) as { id: string; name: string };
            return { id: data.id, name: data.name } satisfies StickerLite;
          })
        );
        if (cancelled) return;
        setStickerById((prev) => {
          const next = { ...prev };
          for (const r of results) {
            if (r.status !== "fulfilled" || !r.value) continue;
            next[r.value.id] = r.value;
          }
          return next;
        });
      } finally {
        if (!cancelled) setIsLoadingStickers(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (!ac.signal.aborted) ac.abort();
    };
  }, [hydrated, rows, stickerById]);

  const onDelete = async (stickerId: string, reviewId: string) => {
    const ok = await notifications.confirm({
      variant: "danger",
      title: "Eliminar reseña",
      message: "¿Eliminar esta reseña? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
    });
    if (!ok) return;

    const current = readStickerReviews(stickerId);
    const next = current.filter((r) => r.id !== reviewId);
    writeStickerReviews(stickerId, next);
    setRows((prev) => prev.filter((row) => !(row.stickerId === stickerId && row.review.id === reviewId)));
    notifications.notify({ variant: "success", title: "Reseña eliminada", message: "Se eliminó correctamente." });
  };

  if (!hydrated) {
    return (
      <div className="p-10 text-center text-white/60">
        <Spinner />
      </div>
    );
  }

  if (rowsSorted.length === 0) {
    return <div className="p-10 text-center text-white/70">No tienes reseñas todavía.</div>;
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Estrellas</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Reseña</th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">
              {isLoadingStickers ? <span className="inline-flex items-center gap-2">Cargando…</span> : "Acciones"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rowsSorted.map(({ stickerId, review }) => {
            const sticker = stickerById[stickerId];
            const productLabel = sticker?.name ?? `#${stickerId.substring(0, 8)}…`;
            const href = `/stickers/${encodeURIComponent(stickerId)}?reviewId=${encodeURIComponent(review.id)}`;
            return (
              <tr
                key={`${stickerId}:${review.id}`}
                tabIndex={0}
                role="link"
                onClick={() => router.push(href)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  router.push(href);
                }}
                className="cursor-pointer hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">{productLabel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{review.rating} ★</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{review.createdAt.slice(0, 10)}</td>
                <td className="px-6 py-4 text-sm text-white/80 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]">
                  {review.comment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void onDelete(stickerId, review.id);
                    }}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
