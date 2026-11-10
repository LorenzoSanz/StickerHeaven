import { describe, it, expect, beforeEach } from "bun:test";
import { ReduceStickerStock } from "./ReduceStickerStock";
import { FakeStickerRepository } from "../testing/FakeStickerRepository";
import { Sticker } from "../../domain/Sticker";
import { StickerName } from "../../domain/StickerName";
import { StickerDescription } from "../../domain/StickerDescription";
import { Money } from "../../../../shared/domain/Money";
import { Quantity } from "../../../../shared/domain/Quantity";
import { StickerStock } from "../../domain/StickerStock";
import { StickerUrl } from "../../domain/StickerUrl";
import { OwnerId } from "../../domain/OwnerId";
import { StickerNotFoundError } from "../../domain/Errors";

describe("ReduceStickerStock", () => {
  let reduceStickerStock: ReduceStickerStock;
  let stickerRepository: FakeStickerRepository;

  beforeEach(() => {
    stickerRepository = new FakeStickerRepository();
    reduceStickerStock = new ReduceStickerStock(stickerRepository);
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

  it("should successfully reduce stock", async () => {
    const sticker = await createStickerWithStock(10);

    const result = await reduceStickerStock.execute({
        id: sticker.id.value,
        quantity: Quantity.create(3).getValue()
    });

    expect(result.isSuccess).toBe(true);
    
    const updatedStickerResult = await stickerRepository.findById(sticker.id);
    expect(updatedStickerResult.isSuccess).toBe(true);
    expect(updatedStickerResult.getValue()!.stock.value).toBe(7);
  });

  it("should fail if sticker not found", async () => {
    const result = await reduceStickerStock.execute({
        id: crypto.randomUUID(),
        quantity: Quantity.create(1).getValue()
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(StickerNotFoundError);
  });

  it("should fail if insufficient stock", async () => {
    const sticker = await createStickerWithStock(5);

    const result = await reduceStickerStock.execute({
        id: sticker.id.value,
        quantity: Quantity.create(6).getValue()
    });

    expect(result.isFailure).toBe(true);
    // El mensaje de DomainError debería contener "Insufficient stock"
    expect(result.error!.message).toContain("Insufficient stock");
    
    // Verifica que el stock no cambia
    const storedStickerResult = await stickerRepository.findById(sticker.id);
    expect(storedStickerResult.isSuccess).toBe(true);
    expect(storedStickerResult.getValue()!.stock.value).toBe(5);
  });
});
