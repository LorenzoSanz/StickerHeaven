import { describe, it, expect, beforeEach } from "bun:test";
import { GetStickersByIds } from "./GetStickersByIds";
import { FakeStickerRepository } from "../testing/FakeStickerRepository";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { StickerName } from "@/modules/Catalog/domain/StickerName";
import { StickerDescription } from "@/modules/Catalog/domain/StickerDescription";
import { Money } from "@/shared/domain/Money";
import { StickerStock } from "@/modules/Catalog/domain/StickerStock";
import { StickerUrl } from "@/modules/Catalog/domain/StickerUrl";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";

describe("GetStickersByIds", () => {
  let getStickersByIds: GetStickersByIds;
  let stickerRepository: FakeStickerRepository;

  beforeEach(() => {
    stickerRepository = new FakeStickerRepository();
    getStickersByIds = new GetStickersByIds(stickerRepository);
  });

  it("should return stickers for valid IDs", async () => {
    const s1 = Sticker.create(
        OwnerId.create(crypto.randomUUID()).getValue(),
        StickerName.create("S1").getValue(),
        StickerDescription.create("D1").getValue(),
        Money.create(10, "USD").getValue(),
        StickerStock.create(5).getValue(),
        StickerUrl.create("http://u.rl").getValue(),
        []
    ).getValue();

    const s2 = Sticker.create(
        OwnerId.create(crypto.randomUUID()).getValue(),
        StickerName.create("S2").getValue(),
        StickerDescription.create("D2").getValue(),
        Money.create(20, "USD").getValue(),
        StickerStock.create(5).getValue(),
        StickerUrl.create("http://u.rl").getValue(),
        []
    ).getValue();

    await stickerRepository.save(s1);
    await stickerRepository.save(s2);

    const result = await getStickersByIds.execute([s1.id.value, s2.id.value]);

    expect(result.isSuccess).toBe(true);
    const dtos = result.getValue();
    expect(dtos).toHaveLength(2);
    expect(dtos.find(d => d.id === s1.id.value)).toBeDefined();
    expect(dtos.find(d => d.id === s2.id.value)).toBeDefined();
  });

  it("should return only found stickers", async () => {
    const s1 = Sticker.create(
        OwnerId.create(crypto.randomUUID()).getValue(),
        StickerName.create("S1").getValue(),
        StickerDescription.create("D1").getValue(),
        Money.create(10, "USD").getValue(),
        StickerStock.create(5).getValue(),
        StickerUrl.create("http://u.rl").getValue(),
        []
    ).getValue();

    await stickerRepository.save(s1);

    const result = await getStickersByIds.execute([s1.id.value, crypto.randomUUID()]);

    expect(result.isSuccess).toBe(true);
    const dtos = result.getValue();
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe(s1.id.value);
  });

  it("should return empty array if no IDs found", async () => {
    const result = await getStickersByIds.execute([crypto.randomUUID(), crypto.randomUUID()]);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toHaveLength(0);
  });
});
