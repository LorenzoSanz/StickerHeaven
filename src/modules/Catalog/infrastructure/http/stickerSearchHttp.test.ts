import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { StickerController } from "./StickerController";
import type { CatalogQueryService } from "../../application/queries/CatalogQueryService";
import type { SearchStickersQuery, PaginatedStickersDTO } from "../../application/queries/SearchStickersQuery";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import type { ListStickersDTO } from "../../application/list/ListStickersDTO";
import type { GetStickerByIdDTO } from "../../application/get-by-id/GetStickerByIdDTO";

const seed = [
  {
    id: "sticker-20",
    ownerId: "owner",
    name: "Sticker 20",
    description: "Precio 20",
    price: { amount: 20, currency: "USD" },
    imageUrl: "https://example.com/20.png",
    tags: ["anime"],
    stock: 10,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "sticker-21",
    ownerId: "owner",
    name: "Sticker 21",
    description: "Precio 21",
    price: { amount: 21, currency: "USD" },
    imageUrl: "https://example.com/21.png",
    tags: ["cute"],
    stock: 10,
    createdAt: "2025-01-02T00:00:00.000Z",
  },
];

function createTestApp(assertQuery: (q: SearchStickersQuery) => void) {
  const catalogQueryService: CatalogQueryService = {
    listStickers: async () => Result.ok<ListStickersDTO, DomainError>({ stickers: [] }),
    getStickerById: async () => Result.ok<GetStickerByIdDTO | null, DomainError>(null),
    search: async (q) => {
      assertQuery(q);
      const data = seed
        .filter((s) => (typeof q.minPrice === "number" ? s.price.amount >= q.minPrice : true))
        .filter((s) => (Array.isArray(q.tags) && q.tags.length ? s.tags.some((t) => q.tags!.includes(t)) : true));
      const result: PaginatedStickersDTO = {
        data,
        meta: { total: data.length, page: q.page ?? 1, limit: q.limit ?? 20, totalPages: 1 },
      };
      return Result.ok<PaginatedStickersDTO, DomainError>(result);
    },
  };

  const logger = { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} } as any;
  const controller = new StickerController(null as any, null as any, null as any, null as any, null as any, null as any, catalogQueryService, logger);

  const app = new Hono();
  app.get("/api/stickers/search", (c) => controller.search(c));
  return app;
}

describe("GET /api/stickers/search (query parsing)", () => {
  it("filters by minPrice (21 should exclude price 20)", async () => {
    const app = createTestApp((q) => {
      expect(q.minPrice).toBe(21);
    });
    const res = await app.request("/api/stickers/search?minPrice=21&limit=50");
    expect(res.status).toBe(200);
    const json = await res.json();
    const ids = (json.data as Array<{ id: string }>).map((x) => x.id);
    expect(ids).toEqual(["sticker-21"]);
  });

  it("normalizes tags (spaces/case) before filtering", async () => {
    const app = createTestApp((q) => {
      expect(q.tags).toEqual(["anime", "cute"]);
    });
    const res = await app.request("/api/stickers/search?tags=Anime,%20cute&limit=50");
    expect(res.status).toBe(200);
    const json = await res.json();
    const ids = (json.data as Array<{ id: string }>).map((x) => x.id).sort();
    expect(ids).toEqual(["sticker-20", "sticker-21"]);
  });

  it("treats NaN minPrice as undefined (does not filter out everything)", async () => {
    const app = createTestApp((q) => {
      expect(q.minPrice).toBeUndefined();
    });
    const res = await app.request("/api/stickers/search?minPrice=NaN&limit=50");
    expect(res.status).toBe(200);
    const json = await res.json();
    const ids = (json.data as Array<{ id: string }>).map((x) => x.id).sort();
    expect(ids).toEqual(["sticker-20", "sticker-21"]);
  });
});
