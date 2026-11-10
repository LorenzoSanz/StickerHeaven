"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SingleSlider } from "@/components/ui/SingleSlider";
import { cn } from "@/lib/utils";
import { getFilterChevronClassName, getSortOptionButtonClassName, getTagOptionButtonClassName } from "./StickerFiltersBar.styles";

type Props = {
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialTags?: string;
  initialSort?: string;
};

type DateSortValue = "" | "newest" | "oldest";
type PriceSortValue = "" | "price_asc" | "price_desc";
type SortValue =
  | ""
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "newest_price_asc"
  | "newest_price_desc"
  | "oldest_price_asc"
  | "oldest_price_desc";

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_0_18px_rgba(0,0,0,0.16)]"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none select-none">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          <div className={getFilterChevronClassName()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function formatCurrency(value: number) {
  return `€${value}`;
}

type StickerFiltersPanelProps = {
  mode: "sidebar" | "drawer";
  onClose?: () => void;
  hasFilters: boolean;
  PRICE_MIN: number;
  PRICE_MAX: number;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
  tagSearch: string;
  setTagSearch: Dispatch<SetStateAction<string>>;
  visibleTagOptions: string[];
  dateSort: DateSortValue;
  setDateSort: Dispatch<SetStateAction<DateSortValue>>;
  priceSort: PriceSortValue;
  setPriceSort: Dispatch<SetStateAction<PriceSortValue>>;
  dateSortOptions: Array<{ value: DateSortValue; label: string; description: string }>;
  priceSortOptions: Array<{ value: PriceSortValue; label: string; description: string }>;
  applyToUrl: () => void;
  clearAll: () => void;
};

function StickerFiltersPanel({
  mode,
  onClose,
  hasFilters,
  PRICE_MIN,
  PRICE_MAX,
  priceRange,
  setPriceRange,
  selectedTags,
  setSelectedTags,
  tagSearch,
  setTagSearch,
  visibleTagOptions,
  dateSort,
  setDateSort,
  priceSort,
  setPriceSort,
  dateSortOptions,
  priceSortOptions,
  applyToUrl,
  clearAll,
}: StickerFiltersPanelProps) {
  const containerClassName =
    mode === "sidebar"
      ? "rounded-2xl border border-white/10 bg-surface/70 backdrop-blur-md p-4 shadow-[0_0_40px_rgba(139,92,246,0.10)]"
      : "h-full flex flex-col";

  return (
    <div className={containerClassName}>
      <div className={cn("flex items-start justify-between gap-3", mode === "sidebar" ? "mb-4" : "px-5 pt-5")}>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-white/70" />
            <div className="text-base font-semibold text-white/90">Filtros</div>
            {hasFilters ? (
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.18)]">
                Activos
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-white/55">Ajusta el catálogo a tu gusto</div>
        </div>

        {mode === "drawer" ? (
          <button
            type="button"
            aria-label="Cerrar filtros"
            className="h-10 w-10 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-primary/30 hover:bg-white/10 transition-all"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <form
        className={cn("space-y-3", mode === "drawer" ? "px-5 pb-5 overflow-auto" : "")}
        onSubmit={(e) => {
          e.preventDefault();
          applyToUrl();
          onClose?.();
        }}
      >
        <FilterSection title="Precio">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-white/60">Rango</div>
              <div className="text-xs font-semibold text-white/80">
                {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="filter-price-min" className="text-xs font-semibold text-white/70">
                  Min
                </label>
                <SingleSlider
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={1}
                  value={priceRange[0]}
                  ariaLabel="Precio mínimo"
                  onValueChange={(nextMin) => {
                    setPriceRange(([_, maxV]) => [Math.min(nextMin, maxV), maxV]);
                  }}
                />
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/50 text-sm">
                    €
                  </div>
                  <Input
                    id="filter-price-min"
                    type="number"
                    inputMode="numeric"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={1}
                    value={String(priceRange[0])}
                    aria-label="Precio mínimo"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      const nextMin = Number.isFinite(v) ? Math.max(PRICE_MIN, Math.min(v, PRICE_MAX)) : PRICE_MIN;
                      setPriceRange(([_, maxV]) => [Math.min(nextMin, maxV), maxV]);
                    }}
                    className="no-number-spin h-11 rounded-xl bg-white/5 border-white/15 hover:border-primary/30 focus-visible:ring-primary pl-7 text-center"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="filter-price-max" className="text-xs font-semibold text-white/70">
                  Max
                </label>
                <SingleSlider
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={1}
                  value={priceRange[1]}
                  ariaLabel="Precio máximo"
                  onValueChange={(nextMax) => {
                    setPriceRange(([minV, _]) => [minV, Math.max(nextMax, minV)]);
                  }}
                />
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/50 text-sm">
                    €
                  </div>
                  <Input
                    id="filter-price-max"
                    type="number"
                    inputMode="numeric"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={1}
                    value={String(priceRange[1])}
                    aria-label="Precio máximo"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      const nextMax = Number.isFinite(v) ? Math.max(PRICE_MIN, Math.min(v, PRICE_MAX)) : PRICE_MAX;
                      setPriceRange(([minV, _]) => [minV, Math.max(nextMax, minV)]);
                    }}
                    className="no-number-spin h-11 rounded-xl bg-white/5 border-white/15 hover:border-primary/30 focus-visible:ring-primary pl-7 text-center"
                    placeholder={String(PRICE_MAX)}
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Tags">
          <div className="space-y-3">
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-white hover:bg-primary/15 transition-all shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                    onClick={() => setSelectedTags((prev) => prev.filter((x) => x !== t))}
                  >
                    {t}
                    <X className="h-3.5 w-3.5 text-white/70" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/55">Selecciona uno o varios tags para filtrar.</div>
            )}

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/50">
                <Search className="h-4 w-4" />
              </div>
              <Input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Buscar tags…"
                aria-label="Buscar tags"
                className="h-11 rounded-xl bg-white/5 border-white/15 hover:border-primary/30 focus-visible:ring-primary pl-10"
              />
            </div>

            <div className="max-h-52 overflow-auto pr-1 scrollbar-no-hover">
              <div className="grid grid-cols-2 gap-2">
                {visibleTagOptions.map((t) => {
                  const active = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setSelectedTags((prev) => {
                          if (prev.includes(t)) return prev.filter((x) => x !== t);
                          return [...prev, t];
                        });
                      }}
                      className={getTagOptionButtonClassName({ active })}
                    >
                      {active ? <Check className="h-3.5 w-3.5 text-primary-light" /> : <span className="h-3.5 w-3.5" />}
                      <span className="truncate">{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Ordenar">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-white/70 mb-2">Fecha</div>
              <div className="grid grid-cols-1 gap-2">
                {dateSortOptions.map((opt) => {
                  const active = dateSort === opt.value;
                  return (
                    <button
                      key={opt.value || "none"}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDateSort(opt.value)}
                      className={getSortOptionButtonClassName({ active })}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white/90">{opt.label}</div>
                          <div className="text-xs text-white/55">{opt.description}</div>
                        </div>
                        {active ? <Check className="h-4 w-4 text-primary-light" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-white/70 mb-2">Precio</div>
              <div className="grid grid-cols-1 gap-2">
                {priceSortOptions.map((opt) => {
                  const active = priceSort === opt.value;
                  return (
                    <button
                      key={opt.value || "none"}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPriceSort(opt.value)}
                      className={getSortOptionButtonClassName({ active })}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white/90">{opt.label}</div>
                          <div className="text-xs text-white/55">{opt.description}</div>
                        </div>
                        {active ? <Check className="h-4 w-4 text-primary-light" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FilterSection>

        <div className={cn("grid grid-cols-2 gap-3", mode === "drawer" ? "pt-2" : "pt-1")}>
          <Button
            type="submit"
            className="h-11 rounded-xl shadow-[0_0_22px_rgba(139,92,246,0.22)] hover:shadow-[0_0_30px_rgba(139,92,246,0.32)]"
          >
            Aplicar
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn("h-11 rounded-xl", hasFilters ? "opacity-100" : "opacity-40")}
            disabled={!hasFilters}
            onClick={() => {
              clearAll();
              onClose?.();
            }}
          >
            Limpiar
          </Button>
        </div>
      </form>
    </div>
  );
}

export function StickerFiltersBar({ initialMinPrice, initialMaxPrice, initialTags, initialSort }: Props) {
  const router = useRouter();
  const current = useSearchParams();

  const PRICE_MIN = 0;
  const PRICE_MAX = 200;

  const initialMin = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(initialMinPrice ?? PRICE_MIN)));
  const initialMax = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(initialMaxPrice ?? PRICE_MAX)));

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.isFinite(initialMin) ? initialMin : PRICE_MIN,
    Number.isFinite(initialMax) ? initialMax : PRICE_MAX,
  ]);

  const [selectedTags, setSelectedTags] = useState<string[]>(
    (initialTags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );

  const [dateSort, setDateSort] = useState<DateSortValue>(() => {
    const s = (initialSort ?? "").trim();
    if (s === "newest" || s === "oldest") return s;
    if (s.startsWith("newest_")) return "newest";
    if (s.startsWith("oldest_")) return "oldest";
    return "";
  });

  const [priceSort, setPriceSort] = useState<PriceSortValue>(() => {
    const s = (initialSort ?? "").trim();
    if (s === "price_asc" || s === "price_desc") return s;
    if (s.endsWith("_price_asc")) return "price_asc";
    if (s.endsWith("_price_desc")) return "price_desc";
    return "";
  });

  const [tagSearch, setTagSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sort: SortValue = useMemo(() => {
    if (dateSort && priceSort) return `${dateSort}_${priceSort}` as SortValue;
    return (dateSort || priceSort) as SortValue;
  }, [dateSort, priceSort]);

  const hasFilters = useMemo(() => {
    const [minV, maxV] = priceRange;
    const priceDirty = minV !== PRICE_MIN || maxV !== PRICE_MAX;
    return Boolean(priceDirty || selectedTags.length > 0 || sort);
  }, [priceRange, selectedTags.length, sort]);

  const tagOptions = useMemo(() => {
    const defaults = [
      "anime",
      "cute",
      "kawaii",
      "meme",
      "gaming",
      "retro",
      "minimal",
      "nature",
      "animals",
      "music",
      "sports",
      "art",
      "travel",
      "food",
    ];
    const fromSelection = selectedTags.filter((t) => !defaults.includes(t));
    return [...defaults, ...fromSelection].sort((a, b) => a.localeCompare(b));
  }, [selectedTags]);

  const visibleTagOptions = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return tagOptions;
    return tagOptions.filter((t) => t.toLowerCase().includes(q));
  }, [tagOptions, tagSearch]);

  const applyToUrl = useMemo(() => {
    return () => {
      const params = new URLSearchParams(current.toString());
      params.delete("page");

      const [minV, maxV] = priceRange;
      if (minV !== PRICE_MIN) params.set("minPrice", String(minV));
      else params.delete("minPrice");

      if (maxV !== PRICE_MAX) params.set("maxPrice", String(maxV));
      else params.delete("maxPrice");

      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      else params.delete("tags");

      if (sort) params.set("sort", sort);
      else params.delete("sort");

      const qs = params.size ? `?${params.toString()}` : "";
      router.push(`/stickers${qs}`);
    };
  }, [PRICE_MAX, PRICE_MIN, current, priceRange, router, selectedTags, sort]);

  const clearAll = useMemo(() => {
    return () => {
      const params = new URLSearchParams(current.toString());
      params.delete("page");
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("tags");
      params.delete("sort");
      const qs = params.size ? `?${params.toString()}` : "";
      router.push(`/stickers${qs}`);
      setPriceRange([PRICE_MIN, PRICE_MAX]);
      setSelectedTags([]);
      setDateSort("");
      setPriceSort("");
      setTagSearch("");
    };
  }, [PRICE_MAX, PRICE_MIN, current, router]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const dateSortOptions: Array<{ value: DateSortValue; label: string; description: string }> = useMemo(
    () => [
      { value: "", label: "Sin fecha", description: "No prioriza la fecha" },
      { value: "newest", label: "Más nuevos", description: "Últimos añadidos primero" },
      { value: "oldest", label: "Más antiguos", description: "Primeros añadidos primero" },
    ],
    []
  );

  const priceSortOptions: Array<{ value: PriceSortValue; label: string; description: string }> = useMemo(
    () => [
      { value: "", label: "Sin precio", description: "No prioriza el precio" },
      { value: "price_asc", label: "Precio ↑", description: "Más barato primero" },
      { value: "price_desc", label: "Precio ↓", description: "Más caro primero" },
    ],
    []
  );

  return (
    <div className="w-full">
      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/30"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 text-white/70" />
            Filtros
            {hasFilters ? (
              <span className="ml-1 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.18)]">
                Activos
              </span>
            ) : null}
          </Button>

          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/30",
              hasFilters ? "opacity-100" : "opacity-40"
            )}
            disabled={!hasFilters}
            onClick={clearAll}
          >
            Limpiar
          </Button>
        </div>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              className="absolute bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl border-t border-white/10 bg-surface/95 shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
            >
              <StickerFiltersPanel
                mode="drawer"
                onClose={() => setDrawerOpen(false)}
                hasFilters={hasFilters}
                PRICE_MIN={PRICE_MIN}
                PRICE_MAX={PRICE_MAX}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                tagSearch={tagSearch}
                setTagSearch={setTagSearch}
                visibleTagOptions={visibleTagOptions}
                dateSort={dateSort}
                setDateSort={setDateSort}
                priceSort={priceSort}
                setPriceSort={setPriceSort}
                dateSortOptions={dateSortOptions}
                priceSortOptions={priceSortOptions}
                applyToUrl={applyToUrl}
                clearAll={clearAll}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden lg:block">
        <StickerFiltersPanel
          mode="sidebar"
          hasFilters={hasFilters}
          PRICE_MIN={PRICE_MIN}
          PRICE_MAX={PRICE_MAX}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          tagSearch={tagSearch}
          setTagSearch={setTagSearch}
          visibleTagOptions={visibleTagOptions}
          dateSort={dateSort}
          setDateSort={setDateSort}
          priceSort={priceSort}
          setPriceSort={setPriceSort}
          dateSortOptions={dateSortOptions}
          priceSortOptions={priceSortOptions}
          applyToUrl={applyToUrl}
          clearAll={clearAll}
        />
      </div>
    </div>
  );
}
