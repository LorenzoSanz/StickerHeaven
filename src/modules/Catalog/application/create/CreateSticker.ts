/**
 * POR QUÉ: Command to create un nuevo sticker.
 * INTEGRIDAD: Orquesta validation and persistence.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { StickerRepository } from "../../domain/StickerRepository";
import { CreateStickerDTO } from "./CreateStickerDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { Sticker } from "../../domain/Sticker";
import { StickerName } from "../../domain/StickerName";
import { StickerDescription } from "../../domain/StickerDescription";
import { Money } from "../../../../shared/domain/Money";
import { StickerUrl } from "../../domain/StickerUrl";
import { OwnerId } from "../../domain/OwnerId";
import { StickerStock } from "../../domain/StickerStock";
import { StickerOwnerAssignmentPolicy } from "../policies/StickerOwnerAssignmentPolicy";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class CreateSticker {
  constructor(
    private stickerRepository: StickerRepository,
    private stickerOwnerAssignmentPolicy: StickerOwnerAssignmentPolicy = new StickerOwnerAssignmentPolicy()
  ) {}

  /**
   * Crea un nuevo sticker en el catálogo.
   * 
   * @param dto - Datos del nuevo sticker.
   * @returns Resultado que contiene el ID del sticker creado.
   */
  async execute(dto: CreateStickerDTO): Promise<Result<{ id: string }, DomainError>> {
    const ownerIdOrError = OwnerId.create(dto.ownerId);
    const requesterIdOrError = OwnerId.create(dto.requesterId);
    const nameOrError = StickerName.create(dto.name);
    const descriptionOrError = StickerDescription.create(dto.description);
    const priceOrError = Money.create(dto.priceAmount, dto.priceCurrency);
    const stockOrError = StickerStock.create(dto.stock);
    const imageUrlOrError = StickerUrl.create(dto.imageUrl);

    if (ownerIdOrError.isFailure) {
      return Result.fail(ownerIdOrError.error!);
    }
    if (requesterIdOrError.isFailure) {
      return Result.fail(requesterIdOrError.error!);
    }
    if (nameOrError.isFailure) {
      return Result.fail(nameOrError.error!);
    }
    if (descriptionOrError.isFailure) {
      return Result.fail(descriptionOrError.error!);
    }
    if (priceOrError.isFailure) {
      return Result.fail(priceOrError.error!);
    }
    if (stockOrError.isFailure) {
      return Result.fail(stockOrError.error!);
    }
    if (imageUrlOrError.isFailure) {
      return Result.fail(imageUrlOrError.error!);
    }

    const ownerPolicyResult = this.stickerOwnerAssignmentPolicy.assertSameOwner(
      ownerIdOrError.getValue(),
      requesterIdOrError.getValue()
    );
    if (ownerPolicyResult.isFailure) {
      return Result.fail(ownerPolicyResult.error!);
    }

    const stickerOrError = Sticker.create(
      ownerIdOrError.getValue(),
      nameOrError.getValue(),
      descriptionOrError.getValue(),
      priceOrError.getValue(),
      stockOrError.getValue(),
      imageUrlOrError.getValue(),
      dto.tags
    );

    if (stickerOrError.isFailure) {
      return Result.fail(stickerOrError.error!);
    }

    const sticker = stickerOrError.getValue();
    const saveResult = await this.stickerRepository.save(sticker);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }

    return Result.ok({ id: sticker.id.value });
  }
}
