import { StickerRepository } from "../../domain/StickerRepository";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { StickerNotFoundError } from "../../domain/Errors";

import { OwnerId } from "../../domain/OwnerId";
import { StickerId } from "../../domain/StickerId";
import { DeleteStickerDTO } from "./DeleteStickerDTO";
import { StickerOwnershipPolicy } from "../policies/StickerOwnershipPolicy";

export class DeleteSticker {
  constructor(
    private stickerRepository: StickerRepository,
    private stickerOwnershipPolicy: StickerOwnershipPolicy = new StickerOwnershipPolicy()
  ) {}

  async execute(dto: DeleteStickerDTO): Promise<Result<void, DomainError>> {
    const { stickerId, requesterId } = dto;
    const stickerIdResult = StickerId.create(stickerId);
    if (stickerIdResult.isFailure) return Result.fail(stickerIdResult.error);
    const id = stickerIdResult.getValue();

    const repoResult = await this.stickerRepository.findById(id);
    if (repoResult.isFailure) {
        return Result.fail(repoResult.error!);
    }
    const sticker = repoResult.getValue();

    if (!sticker) {
      return Result.fail(new StickerNotFoundError(stickerId));
    }

    const ownerIdOrError = OwnerId.create(requesterId);
    if (ownerIdOrError.isFailure) {
       // Asumimos que requesterId viene de una fuente confiable (middleware de auth), así que esto debería ser raro.
       // Pero deberíamos gestionarlo o asumirlo válido si confiamos en la infraestructura.
       // Aun así, estrictamente deberíamos validarlo.
       return Result.fail(ownerIdOrError.error!);
    }

    const ownershipResult = this.stickerOwnershipPolicy.assertOwner(sticker, ownerIdOrError.getValue());
    if (ownershipResult.isFailure) return Result.fail(ownershipResult.error!);

    const deleteResult = await this.stickerRepository.delete(id);
    if (deleteResult.isFailure) {
        return Result.fail(deleteResult.error!);
    }

    return Result.ok();
  }
}
