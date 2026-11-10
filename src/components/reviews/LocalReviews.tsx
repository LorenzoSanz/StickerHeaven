"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
  authorId?: string;
  authorEmail?: string;
};

// Genera una clave única para almacenar reseñas basada en el ID del sticker.
function storageKey(stickerId: string) {
  return `sticker_reviews_${stickerId}`;
}

// Lee reseñas almacenadas localmente para un sticker específico.
function readReviews(stickerId: string): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(stickerId));
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
      .filter((r) => r.rating >= 1 && r.rating <= 5);
  } catch {
    return [];
  }
}

// Escribe reseñas localmente para un sticker específico.
function writeReviews(stickerId: string, reviews: Review[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(stickerId), JSON.stringify(reviews));
}

export function LocalReviews({ stickerId, className }: { stickerId: string; className?: string }) {
  const { notify } = useNotifications();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // Carga reseñas al montar el componente.
  useEffect(() => {
    const loaded = readReviews(stickerId);
    let changed = false;
    const normalized = loaded.map((r, idx) => {
      if (!r.id) {
        changed = true;
        return { ...r, id: `${r.createdAt}-${idx}` };
      }
      return r;
    });
    const raf = window.requestAnimationFrame(() => {
      setReviews(normalized);
      if (changed) writeReviews(stickerId, normalized);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [stickerId]);
 
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await fetch("/api/auth/me", { method: "GET" });
      if (!res.ok) return;
      const data = (await res.json()) as { user: { id: string; name: string; email: string } };
      if (!cancelled) setCurrentUser(data.user);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resalta y desplaza a la reseña con el ID especificado en los parámetros de búsqueda.
  useEffect(() => {
    const reviewId = searchParams.get("reviewId");
    if (!reviewId) return;
    if (reviews.length === 0) return;
    const el = itemRefs.current[reviewId];
    if (!el) return;

    const raf = window.requestAnimationFrame(() => setHighlightedId(reviewId));
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
    const t = window.setTimeout(() => setHighlightedId((prev) => (prev === reviewId ? null : prev)), 2500);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [reviews, searchParams]);

  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Reseñas</div>
          <div className="mt-1 text-sm text-white/60">
            {reviews.length === 0 ? "Aún no hay reseñas." : `${avg.toFixed(1)} / 5 (${reviews.length})`}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <div
            onMouseLeave={() => setHoverRating(null)}
            className="h-10 inline-flex items-center rounded-md border border-white/10 bg-surface px-1"
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const active = (hoverRating ?? rating) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                  onMouseEnter={() => setHoverRating(value)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(null)}
                  onClick={() => setRating(value)}
                  className={cn(
                    "h-9 w-9 grid place-items-center rounded-md transition-all active:scale-[0.96] motion-reduce:transform-none",
                    active ? "text-primary drop-shadow-[0_0_14px_rgba(139,92,246,0.35)]" : "text-white/25 hover:text-primary/70",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                >
                  <Star className="h-5 w-5" fill={active ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>

          <Input
            placeholder="Escribe una reseña…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button
            type="button"
            onClick={() => {
              const trimmed = comment.trim();
              const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
              const authorName = currentUser?.name || currentUser?.email || "Anónimo";
              const authorId = currentUser?.id;
              const authorEmail = currentUser?.email;
              const next: Review[] = [
                {
                  id,
                  rating,
                  comment: trimmed || "Sin comentario",
                  createdAt: new Date().toISOString(),
                  authorName,
                  authorId,
                  authorEmail,
                },
                ...reviews,
              ].slice(0, 20);
              setReviews(next);
              writeReviews(stickerId, next);
              notify({ variant: "success", title: "Review publicada con Éxito" });
              setComment("");
              setRating(5);
              setHoverRating(null);
            }}
          >
            Publicar
          </Button>
        </div>

        {reviews.length > 0 ? (
          <ul className="mt-1">
            {reviews.slice(0, 5).map((r, idx) => (
              <li
                key={r.id || `${r.createdAt}-${idx}`}
                ref={(node) => {
                  itemRefs.current[r.id] = node;
                }}
                tabIndex={-1}
                className={cn(
                  "py-4 outline-none transition-colors after:mt-4 after:block after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent last:after:hidden",
                  highlightedId === r.id ? "bg-white/5 px-3 border-l-2 border-primary/60 shadow-[0_0_28px_rgba(139,92,246,0.12)]" : ""
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{r.rating} ★</div>
                    <div className="text-xs text-white/50 truncate">por {r.authorName}</div>
                  </div>
                  <div className="text-xs text-white/40">{r.createdAt.slice(0, 10)}</div>
                </div>
                <div className="mt-1 text-sm text-white/70">{r.comment}</div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
