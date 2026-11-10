/**
 * POR QUÉ: Prueba el DeleteSticker caso de uso.
 * INTEGRIDAD: Verifica authorization and deletion logic.
 * ESTRUCTURA: Suite de tests - Unit Pruebas.
 */
import { describe, it, expect, beforeEach } from "bun:test";
import { DeleteSticker } from "./DeleteSticker";
import { FakeStickerRepository } from "../testing/FakeStickerRepository";
import { Sticker } from "../../domain/Sticker";
import { StickerName } from "../../domain/StickerName";
import { StickerDescription } from "../../domain/StickerDescription";
import { Money } from "../../../../shared/domain/Money";
import { StickerStock } from "../../domain/StickerStock";
import { StickerUrl } from "../../domain/StickerUrl";
import { OwnerId } from "../../domain/OwnerId";
import { StickerNotFoundError, StickerOwnershipError } from "../../domain/Errors";

describe("DeleteSticker", () => {
  let deleteSticker: DeleteSticker;
  let stickerRepository: FakeStickerRepository;

  beforeEach(() => {
    stickerRepository = new FakeStickerRepository();
    deleteSticker = new DeleteSticker(stickerRepository);
  });

  it("should delete a sticker if owned by requester", async () => {
    const ownerId = crypto.randomUUID();
    const sticker = Sticker.create(
      OwnerId.create(ownerId).getValue(),
      StickerName.create("S1").getValue(),
      StickerDescription.create("Desc1").getValue(),
      Money.create(10, "USD").getValue(),
      StickerStock.create(10).getValue(),
      StickerUrl.create("http://img.com/1.png").getValue(),
      ["tag1"]
    ).getValue();

    await stickerRepository.save(sticker);

    const result = await deleteSticker.execute({
        stickerId: sticker.id.value,
        requesterId: ownerId
    });

    expect(result.isSuccess).toBe(true);
    const deletedResult = await stickerRepository.findById(sticker.id);
    expect(deletedResult.isSuccess).toBe(true);
    expect(deletedResult.getValue()).toBeNull();
  });

  it("should fail if sticker not found", async () => {
    const result = await deleteSticker.execute({
        stickerId: crypto.randomUUID(),
        requesterId: crypto.randomUUID()
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(StickerNotFoundError);
  });

  it("should fail if requester is not owner", async () => {
    const ownerId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const sticker = Sticker.create(
      OwnerId.create(ownerId).getValue(),
      StickerName.create("S1").getValue(),
      StickerDescription.create("Desc1").getValue(),
      Money.create(10, "USD").getValue(),
      StickerStock.create(10).getValue(),
      StickerUrl.create("http://img.com/1.png").getValue(),
      ["tag1"]
    ).getValue();

    await stickerRepository.save(sticker);

    const result = await deleteSticker.execute({
        stickerId: sticker.id.value,
        requesterId: otherUserId
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(StickerOwnershipError);
  });
});
