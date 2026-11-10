import { StickerRepository } from "@/modules/Catalog/domain/StickerRepository";
import { StickerDTO } from "../list/ListStickersDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { StickerId } from "@/shared/domain/StickerId";

export class GetStickersByIds {
  constructor(private stickerRepository: StickerRepository) {}

  async execute(ids: string[]): Promise<Result<StickerDTO[], DomainError>> {
    const stickerIds: StickerId[] = [];
    for (const id of ids) {
        const idResult = StickerId.create(id);
        if (idResult.isSuccess) {
            stickerIds.push(idResult.getValue());
        }
    }

    const stickersResult = await this.stickerRepository.findByIds(stickerIds);
    if (stickersResult.isFailure) {
        return Result.fail(stickersResult.error!);
    }
    const stickers = stickersResult.getValue();

    const dtos: StickerDTO[] = stickers.map(sticker => ({
      id: sticker.id.value,
      ownerId: sticker.ownerId.value,
      name: sticker.name.value,
      description: sticker.description.value,
      price: {
        amount: sticker.price.amount,
        currency: sticker.price.currency
      },
      imageUrl: sticker.imageUrl.value,
      tags: sticker.tags.map(t => t.value),
      stock: sticker.stock.value,
      createdAt: sticker.createdAt.toISOString()
    }));

    return Result.ok(dtos);
  }
}
