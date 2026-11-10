import { describe, it, expect, beforeEach } from "bun:test";
import { RestoreStickerStock } from "./RestoreStickerStock";
import { FakeStickerRepository } from "../testing/FakeStickerRepository";
import { Sticker } from "../../domain/Sticker";
import { StickerName } from "../../domain/StickerName";
import { StickerDescription } from "../../domain/StickerDescription";
import { Money } from "../../../../shared/domain/Money";
import { StickerStock } from "../../domain/StickerStock";
import { StickerUrl } from "../../domain/StickerUrl";
import { OwnerId } from "../../domain/OwnerId";
import { StickerNotFoundError } from "../../domain/Errors";
import { Quantity } from "../../../../shared/domain/Quantity";

// Tests que demuestren la lógica de negocio de la restauración de stock de stickers.
describe("RestoreStickerStock", () => {
  let restoreStickerStock: RestoreStickerStock;
  let stickerRepository: FakeStickerRepository;

  beforeEach(() => {
    stickerRepository = new FakeStickerRepository();
    restoreStickerStock = new RestoreStickerStock(stickerRepository);
  });

  const createStickerWithStock = async (stock: number) => {
    const sticker = Sticker.create(
        OwnerId.create(crypto.randomUUID()).getValue(),
        StickerName.create("Sticker").getValue(),
        StickerDescription.create("Desc").getValue(),
        Money.create(10, "USD").getValue(),
        StickerStock.create(stock).getValue(),
        StickerUrl.create("http://url.com").getValue(),
        []
    ).getValue();
    await stickerRepository.save(sticker);
    return sticker;
  };

  it("should successfully restore stock", async () => {
    const sticker = await createStickerWithStock(10);

    const result = await restoreStickerStock.execute({
        id: sticker.id.value,
        quantity: Quantity.create(5).getValue()
    });

    expect(result.isSuccess).toBe(true);
    
    const updatedStickerResult = await stickerRepository.findById(sticker.id);
    expect(updatedStickerResult.isSuccess).toBe(true);
    expect(updatedStickerResult.getValue()!.stock.value).toBe(15);
  });

  it("should fail if sticker not found", async () => {
    const result = await restoreStickerStock.execute({
        id: crypto.randomUUID(),
        quantity: Quantity.create(1).getValue()
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(StickerNotFoundError);
  });
});
