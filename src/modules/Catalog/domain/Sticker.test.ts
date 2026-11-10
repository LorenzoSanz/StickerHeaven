
import { describe, it, expect } from "bun:test";
import { Sticker } from "./Sticker";
import { OwnerId } from "./OwnerId";
import { StickerName } from "./StickerName";
import { StickerDescription } from "./StickerDescription";
import { Money } from "../../../shared/domain/Money";
import { StickerStock } from "./StickerStock";
import { StickerUrl } from "./StickerUrl";
import { StickerId } from "@/shared/domain/StickerId";

describe("Sticker Aggregate", () => {
  const validOwnerId = OwnerId.create(crypto.randomUUID()).getValue();
  const validName = StickerName.create("Cool Sticker").getValue();
  const validDesc = StickerDescription.create("A very cool sticker").getValue();
  const validPrice = Money.create(10, "EUR").getValue();
  const validStock = StickerStock.create(100).getValue();
  const validUrl = StickerUrl.create("http://example.com/image.png").getValue();

  it("should create a valid Sticker", () => {
    const stickerResult = Sticker.create(
      validOwnerId,
      validName,
      validDesc,
      validPrice,
      validStock,
      validUrl,
      ["cool", "tech"]
    );

    expect(stickerResult.isSuccess).toBe(true);
    const sticker = stickerResult.getValue();
    expect(sticker.name.value).toBe("Cool Sticker");
    expect(sticker.tags.length).toBe(2);
    expect(sticker.tags[0].value).toBe("cool");
    expect(sticker.createdAt).toBeInstanceOf(Date);
    expect(sticker.id).toBeInstanceOf(StickerId);
  });

  it("should fail to create if tags are invalid", () => {
    const stickerResult = Sticker.create(
      validOwnerId,
      validName,
      validDesc,
      validPrice,
      validStock,
      validUrl,
      [""] // Invalid tag
    );

    expect(stickerResult.isFailure).toBe(true);
  });

  it("should update sticker properties", async () => {
    const sticker = Sticker.create(
      validOwnerId,
      validName,
      validDesc,
      validPrice,
      validStock,
      validUrl
    ).getValue();

    // Espera 1ms para asegurar diferencia en timestamps
    await new Promise(resolve => setTimeout(resolve, 1));

    const newName = StickerName.create("Super Cool Sticker").getValue();
    const updateResult = sticker.update(newName);

    expect(updateResult.isSuccess).toBe(true);
    expect(sticker.name.value).toBe("Super Cool Sticker");
    expect(sticker.updatedAt.getTime()).toBeGreaterThan(sticker.createdAt.getTime());
  });

  it("should verify ownership", () => {
    const sticker = Sticker.create(
      validOwnerId,
      validName,
      validDesc,
      validPrice,
      validStock,
      validUrl
    ).getValue();

    const ownerId1 = OwnerId.create(validOwnerId.value).getValue();
    const ownerId2 = OwnerId.create(crypto.randomUUID()).getValue();

    expect(sticker.isOwnedBy(ownerId1)).toBe(true);
    expect(sticker.isOwnedBy(ownerId2)).toBe(false);
  });
});
