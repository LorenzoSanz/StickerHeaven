"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "wishlist_sticker_ids";

function readIds(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

function writeIds(storageKey: string, ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(ids));
}

export function useWishlist({ storageKey = STORAGE_KEY }: { storageKey?: string } = {}) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setIds(readIds(storageKey));
      setHydrated(true);
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      setIds(readIds(storageKey));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("storage", onStorage);
    };
  }, [storageKey]);

  const idSet = useMemo(() => new Set(ids), [ids]);

  const isFavorite = useCallback((id: string) => idSet.has(id), [idSet]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeIds(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const clear = useCallback(() => {
    setIds([]);
    writeIds(storageKey, []);
  }, [storageKey]);

  return { ids, hydrated, isFavorite, toggle, clear };
}
