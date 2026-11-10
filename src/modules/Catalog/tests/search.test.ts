import { describe, it, expect, beforeEach } from "bun:test";
import { InMemoryCatalogQueryService } from "../application/testing/InMemoryCatalogQueryService";
import type { GetStickerByIdDTO } from "../application/get-by-id/GetStickerByIdDTO";

describe("Catalog Search (Read Model)", () => {
  let queryService: InMemoryCatalogQueryService;

  beforeEach(() => {
    queryService = new InMemoryCatalogQueryService();

    const stickers: GetStickerByIdDTO[] = [
      {
        id: "s1",
        ownerId: "u1",
        name: "Cyber Skull",
        description: "Neon cyber skull sticker",
        price: { amount: 10, currency: "USD" },
        imageUrl: "http://img/1",
        tags: ["cyber", "skull"],
        stock: 10,
        createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
      },
      {
        id: "s2",
        ownerId: "u1",
        name: "Retro Sunset",
        description: "80s vibe",
        price: { amount: 5, currency: "USD" },
        imageUrl: "http://img/2",
        tags: ["retro", "sunset"],
        stock: 10,
        createdAt: new Date("2024-01-02T00:00:00.000Z").toISOString(),
      },
      {
        id: "s3",
        ownerId: "u2",
        name: "Coffee Lover",
        description: "Hot coffee cup",
        price: { amount: 20, currency: "USD" },
        imageUrl: "http://img/3",
        tags: ["coffee"],
        stock: 10,
        createdAt: new Date("2024-01-03T00:00:00.000Z").toISOString(),
      },
      {
        id: "s4",
        ownerId: "u2",
        name: "Coffee Lover (Small)",
        description: "Hot coffee cup - small",
        price: { amount: 15, currency: "USD" },
        imageUrl: "http://img/4",
        tags: ["coffee"],
        stock: 10,
        createdAt: new Date("2024-01-03T00:00:00.000Z").toISOString(),
      },
    ];

    for (const s of stickers) queryService.addSticker(s);
  });

  it("should filter by text search across name/description/tags", async () => {
    const result = await queryService.search({ search: "skull", page: 1, limit: 20 });
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().data.map((s) => s.id)).toEqual(["s1"]);

    const resultByTag = await queryService.search({ search: "retro", page: 1, limit: 20 });
    expect(resultByTag.getValue().data.map((s) => s.id)).toEqual(["s2"]);
  });

  it("should filter by tags and price range", async () => {
    const byTags = await queryService.search({ tags: ["coffee", "skull"], page: 1, limit: 20 });
    expect(byTags.getValue().data.map((s) => s.id).sort()).toEqual(["s1", "s3", "s4"]);

    const byPrice = await queryService.search({ minPrice: 6, maxPrice: 15, page: 1, limit: 20 });
    expect(byPrice.getValue().data.map((s) => s.id).sort()).toEqual(["s1", "s4"]);
  });

  it("should sort and paginate deterministically", async () => {
    const sorted = await queryService.search({ sortBy: "price_asc", page: 1, limit: 2 });
    const value = sorted.getValue();
    expect(value.data.map((s) => s.id)).toEqual(["s2", "s1"]);
    expect(value.meta.total).toBe(4);
    expect(value.meta.totalPages).toBe(2);
  });

  it("should allow composed sorting (newest then price)", async () => {
    const sorted = await queryService.search({ sortBy: "newest_price_asc", page: 1, limit: 20 });
    expect(sorted.isSuccess).toBe(true);
    expect(sorted.getValue().data.map((s) => s.id)).toEqual(["s4", "s3", "s2", "s1"]);
  });

  it("should allow composed sorting (oldest then price)", async () => {
    const sorted = await queryService.search({ sortBy: "oldest_price_desc", page: 1, limit: 20 });
    expect(sorted.isSuccess).toBe(true);
    expect(sorted.getValue().data.map((s) => s.id)).toEqual(["s1", "s2", "s3", "s4"]);
  });
});
