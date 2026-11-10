/**
 * POR QUÉ: Algunas pantallas necesitan hidratar varios stickers a la vez (batch) sin múltiples roundtrips.
 * INTEGRIDAD: Devuelve DTOs (read-model) para consumo externo sin exponer entidades de dominio.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { StickerRepository } from "../../domain/StickerRepository";
import { StickerDTO } from "../list/ListStickersDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { StickerId } from "../../domain/StickerId";

/**
 * POR QUÉ: Aísla la lógica de validación de ids + mapping a DTO en un único punto reutilizable.
 */
export class GetStickersByIds {
  constructor(private stickerRepository: StickerRepository) {}

  async execute(ids: string[]): Promise<Result<StickerDTO[], DomainError>> {
    const stickerIds: StickerId[] = [];
    for (const id of ids) {
        const idResult = StickerId.create(id);
        // POR QUÉ: Un id inválido no debe tumbar toda la query batch; simplemente lo ignoramos.
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
