"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

/**
 * Barra de búsqueda para stickers.
 * Permite buscar stickers por nombre.
 */
export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/stickers?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/stickers");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input
        type="text"
        aria-label="Buscar stickers"
        placeholder="Buscar stickers…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-full pr-10 shadow-[0_0_20px_rgba(0,0,0,0.35)] hover:border-primary/40 transition-colors"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
