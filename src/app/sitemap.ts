
import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { serverApiFetch } from "@/lib/serverApi";
import type { PaginatedStickersDTO } from "@/modules/Catalog/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/stickers`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/register`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  try {
    const limit = 200;
    const maxPages = 25;
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= maxPages) {
      const res = await serverApiFetch<PaginatedStickersDTO>(
        `/api/stickers/search?page=${page}&limit=${limit}`,
        { method: "GET", includeCookies: false, next: { revalidate: 60 * 60 } }
      );

      totalPages = res.meta.totalPages;

      for (const sticker of res.data) {
        entries.push({
          url: `${baseUrl}/stickers/${encodeURIComponent(sticker.id)}`,
          lastModified: new Date(sticker.createdAt),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      page += 1;
    }
  } catch {
    return entries;
  }

  return entries;
}
