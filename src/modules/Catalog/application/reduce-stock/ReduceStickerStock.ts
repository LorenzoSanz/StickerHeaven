import { StickerRepository } from "../../domain/StickerRepository";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { StickerNotFoundError } from "../../domain/Errors";
import { StickerStock } from "../../domain/StickerStock";
import { StickerId } from "../../domain/StickerId";

import { Quantity } from "../../../../shared/domain/Quantity";
import { ReduceStickerStockDTO } from "./ReduceStickerStockDTO";

export class ReduceStickerStock {
  constructor(private stickerRepository: StickerRepository) {}

  async execute(dto: ReduceStickerStockDTO): Promise<Result<void, DomainError>> {
    const { id, quantity } = dto;
    const stickerIdResult = StickerId.create(id);
    if (stickerIdResult.isFailure) return Result.fail(stickerIdResult.error);

    const repoResult = await this.stickerRepository.findById(stickerIdResult.getValue());
    if (repoResult.isFailure) {
        return Result.fail(repoResult.error!);
    }
    const sticker = repoResult.getValue();

    if (!sticker) {
      return Result.fail(new StickerNotFoundError(id));
    }

    const currentStock = sticker.stock.value;
    const newStockOrError = StickerStock.create(currentStock - quantity.value);

    if (newStockOrError.isFailure) {
      return Result.fail(new DomainError(`Insufficient stock for sticker ${id}`));
    }

    const updateResult = sticker.update(
        undefined, 
        undefined, 
        undefined, 
        newStockOrError.getValue(), 
        undefined, 
        undefined
    );

    if (updateResult.isFailure) {
        return Result.fail(updateResult.error!);
    }

    const saveResult = await this.stickerRepository.save(sticker);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }
    return Result.ok();
  }
}
