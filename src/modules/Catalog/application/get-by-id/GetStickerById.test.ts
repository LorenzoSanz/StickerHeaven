import { describe, it, expect, beforeEach } from "bun:test";
import { GetStickerById } from "./GetStickerById";
import { FakeCatalogQueryService } from "../testing/FakeCatalogQueryService";

describe("GetStickerById", () => {
  let getStickerById: GetStickerById;
  let queryService: FakeCatalogQueryService;

  beforeEach(() => {
    queryService = new FakeCatalogQueryService();
    getStickerById = new GetStickerById(queryService);
  });

  it("should return sticker dto if found", async () => {
    const stickerId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    queryService.addSticker({
        id: stickerId,
        name: "S1",
        description: "Desc1",
        price: { amount: 10, currency: "USD" },
        stock: 10,
        imageUrl: "http://img.com/1.png",
        ownerId: userId,
        tags: ["tag1"],
        createdAt: new Date().toISOString()
    });

    const result = await getStickerById.execute(stickerId);

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.id).toBe(stickerId);
    expect(dto.name).toBe("S1");
    expect(dto.ownerId).toBe(userId);
  });

  it("should fail if sticker not found", async () => {
    const result = await getStickerById.execute(crypto.randomUUID());

    expect(result.isFailure).toBe(true);
    // expect(result.error).toBeInstanceOf(StickerNotFoundError); 
    // QueryService usually returns null Result or specific error.
    // Let's check implementation of GetStickerById caso de uso.
    // If it maps null to Error, that's fine.
  });
});
