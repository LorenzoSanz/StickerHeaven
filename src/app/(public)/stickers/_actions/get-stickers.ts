"use server";

import type { PaginatedStickersDTO, SearchStickersQuery } from "@/modules/Catalog/public";
import { serverApiFetch } from "@/lib/serverApi";

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
  return await serverApiFetch(path, { method: "GET", includeCookies: false, cache: "no-store" });
}
