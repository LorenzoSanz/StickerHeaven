/**
 * POR QUÉ: La página pública necesita consultar el catálogo desde SSR sin depender del cliente (mejor SEO/TTFB).
 * QUÉ: Construye querystring de filtros/orden/paginación y llama al endpoint read-model del catálogo.
 * LÍMITES: Es una Query (solo lectura); no incluye cookies porque no depende de sesión.
 */
"use server";

import type { PaginatedStickersDTO, SearchStickersQuery } from "@/modules/Catalog/public";
import { serverApiFetch } from "@/lib/serverApi";

/**
 * POR QUÉ: Normalizamos la creación de URLSearchParams para que el UI no duplique lógica de serialización.
 * FLUJO: UI (public) → Server Action → GET /api/stickers/search → CatalogQueryService → respuesta paginada.
 */
export async function getStickersAction(query?: SearchStickersQuery): Promise<PaginatedStickersDTO> {
  const params = new URLSearchParams();
  const q = query || {};

  if (typeof q.page === "number") params.set("page", String(q.page));
  if (typeof q.limit === "number") params.set("limit", String(q.limit));
  if (q.search) params.set("search", q.search);
  if (typeof q.minPrice === "number") params.set("minPrice", String(q.minPrice));
  if (typeof q.maxPrice === "number") params.set("maxPrice", String(q.maxPrice));
  if (Array.isArray(q.tags) && q.tags.length > 0) params.set("tags", q.tags.join(","));
  if (q.ownerId) params.set("ownerId", q.ownerId);
  if (q.sortBy) params.set("sortBy", String(q.sortBy));

  const path = `/api/stickers/search${params.size ? `?${params.toString()}` : ""}`;
  // POR QUÉ: Los filtros por interacción de usuario deben reflejarse inmediatamente; cachear aquí puede hacer que parezca que no aplican.
  // QUÉ: Desactiva caché de fetch para esta Query y evita servir resultados desactualizados para combinaciones de filtros.
  return await serverApiFetch(path, { method: "GET", includeCookies: false, cache: "no-store" });
}
