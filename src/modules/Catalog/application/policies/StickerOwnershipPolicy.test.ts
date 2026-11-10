import { describe, it, expect } from "bun:test";
import { StickerOwnershipPolicy } from "./StickerOwnershipPolicy";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { StickerName } from "@/modules/Catalog/domain/StickerName";
import { StickerDescription } from "@/modules/Catalog/domain/StickerDescription";
import { StickerStock } from "@/modules/Catalog/domain/StickerStock";
import { StickerUrl } from "@/modules/Catalog/domain/StickerUrl";
import { Money } from "@/shared/domain/Money";

// Tests que demuestren la lógica de negocio de la política de propiedad de stickers.
describe("StickerOwnershipPolicy", () => {
  it("should allow the owner", () => {
    const owner = OwnerId.create(crypto.randomUUID()).getValue();
    const sticker = Sticker.create(
      owner,
      StickerName.create("Sticker").getValue(),
      StickerDescription.create("Desc").getValue(),
      Money.create(100, "USD").getValue(),
      StickerStock.create(1).getValue(),
      StickerUrl.create("https://example.com/img.png").getValue(),
      []
    ).getValue();

    const policy = new StickerOwnershipPolicy();
    const result = policy.assertOwner(sticker, owner);

    expect(result.isSuccess).toBe(true);
  });

  it("should deny a non-owner", () => {
    const owner = OwnerId.create(crypto.randomUUID()).getValue();
    const other = OwnerId.create(crypto.randomUUID()).getValue();
    const sticker = Sticker.create(
      owner,
      StickerName.create("Sticker").getValue(),
      StickerDescription.create("Desc").getValue(),
      Money.create(100, "USD").getValue(),
      StickerStock.create(1).getValue(),
      StickerUrl.create("https://example.com/img.png").getValue(),
      []
    ).getValue();

    const policy = new StickerOwnershipPolicy();
    const result = policy.assertOwner(sticker, other);

    expect(result.isFailure).toBe(true);
  });
});
