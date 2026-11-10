/**
 * POR QUÉ: Prueba el ListStickers caso de uso.
 * INTEGRIDAD: Verifica retrieval and mapping of sticker data.
 * ESTRUCTURA: Suite de tests - Unit Pruebas.
 */
import { describe, it, expect, beforeEach } from "bun:test";
import { ListStickers } from "./ListStickers";
import { FakeCatalogQueryService } from "../testing/FakeCatalogQueryService";

describe("ListStickers", () => {
  let listStickers: ListStickers;
  let queryService: FakeCatalogQueryService;

  beforeEach(() => {
    queryService = new FakeCatalogQueryService();
    listStickers = new ListStickers(queryService);
  });

  it("should return all stickers as dtos", async () => {
    const stickerId1 = crypto.randomUUID();
    const stickerId2 = crypto.randomUUID();
    const userId1 = crypto.randomUUID();
    const userId2 = crypto.randomUUID();

    queryService.addSticker({
        id: stickerId1,
        name: "S1",
        description: "Desc1",
        price: { amount: 10, currency: "USD" },
        stock: 10,
        imageUrl: "http://img/1",
        ownerId: userId1,
        tags: [],
        createdAt: new Date().toISOString()
    });
    queryService.addSticker({
        id: stickerId2,
        name: "S2",
        description: "Desc2",
        price: { amount: 20, currency: "EUR" },
        stock: 10,
        imageUrl: "http://img/2",
        ownerId: userId2,
        tags: [],
        createdAt: new Date().toISOString()
    });

    const result = await listStickers.execute();

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue(); // Returns { stickers: [...] }
    expect(dto.stickers).toHaveLength(2);
  });

  it("should return empty list if no stickers", async () => {
    const result = await listStickers.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().stickers).toHaveLength(0);
  });
});
