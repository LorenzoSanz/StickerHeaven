import { StickerRepository } from "../../domain/StickerRepository";
import type { IImageStorageService } from "@/modules/Catalog/domain/gateways/IImageStorageService";
import type { UpdateStickerDTO } from "../update/UpdateStickerDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { StickerId } from "@/shared/domain/StickerId";
import { StickerName } from "../../domain/StickerName";
import { StickerDescription } from "../../domain/StickerDescription";
import { Money } from "@/shared/domain/Money";
import { StickerUrl } from "../../domain/StickerUrl";
import { StickerStock } from "../../domain/StickerStock";
import { StickerNotFoundError } from "../../domain/Errors";
import { OwnerId } from "../../domain/OwnerId";
import { StickerOwnershipPolicy } from "../policies/StickerOwnershipPolicy";

export type UpdateStickerWithImageDTO = UpdateStickerDTO & {
  image?: { buffer: Buffer; filename?: string };
};

export class UpdateStickerWithImage {
  constructor(
    private stickerRepository: StickerRepository,
    private imageStorage: IImageStorageService,
    private stickerOwnershipPolicy: StickerOwnershipPolicy = new StickerOwnershipPolicy()
  ) {}

  async execute(dto: UpdateStickerWithImageDTO): Promise<Result<void, DomainError>> {
    const stickerIdOrError = StickerId.create(dto.stickerId);
    if (stickerIdOrError.isFailure) return Result.fail(stickerIdOrError.error!);
    const stickerId = stickerIdOrError.getValue();

    const stickerResult = await this.stickerRepository.findById(stickerId);
    if (stickerResult.isFailure) return Result.fail(stickerResult.error!);
    const sticker = stickerResult.getValue();
    if (!sticker) return Result.fail(new StickerNotFoundError(dto.stickerId));

    const ownerIdOrError = OwnerId.create(dto.ownerId);
    if (ownerIdOrError.isFailure) return Result.fail(ownerIdOrError.error!);
    const ownershipResult = this.stickerOwnershipPolicy.assertOwner(sticker, ownerIdOrError.getValue());
    if (ownershipResult.isFailure) return Result.fail(ownershipResult.error!);

    let name: StickerName | undefined;
    if (dto.name) {
      const nameRes = StickerName.create(dto.name);
      if (nameRes.isFailure) return Result.fail(nameRes.error!);
      name = nameRes.getValue();
    }

    let description: StickerDescription | undefined;
    if (dto.description) {
      const descRes = StickerDescription.create(dto.description);
      if (descRes.isFailure) return Result.fail(descRes.error!);
      description = descRes.getValue();
    }

    let price: Money | undefined;
    if (dto.price) {
      const priceRes = Money.create(dto.price.amount, dto.price.currency);
      if (priceRes.isFailure) return Result.fail(priceRes.error!);
      price = priceRes.getValue();
    }

    let stock: StickerStock | undefined;
    if (dto.stock !== undefined) {
      const stockRes = StickerStock.create(dto.stock);
      if (stockRes.isFailure) return Result.fail(stockRes.error!);
      stock = stockRes.getValue();
    }

    const previousImageUrl = sticker.imageUrl.value;
    let imageUrl: StickerUrl | undefined;
    let uploadedImageUrl: string | null = null;

    if (dto.image?.buffer && dto.image.buffer.length > 0) {
      const uploadResult = await this.imageStorage.upload(dto.image.buffer, dto.image.filename);
      if (uploadResult.isFailure) return Result.fail(uploadResult.error!);
      uploadedImageUrl = uploadResult.getValue();
      const urlRes = StickerUrl.create(uploadedImageUrl);
      if (urlRes.isFailure) return Result.fail(urlRes.error!);
      imageUrl = urlRes.getValue();
    } else if (dto.imageUrl) {
      const urlRes = StickerUrl.create(dto.imageUrl);
      if (urlRes.isFailure) return Result.fail(urlRes.error!);
      imageUrl = urlRes.getValue();
    }

    const updateResult = sticker.update(name, description, price, stock, imageUrl, dto.tags);
    if (updateResult.isFailure) return Result.fail(updateResult.error!);

    const saveResult = await this.stickerRepository.save(sticker);
    if (saveResult.isFailure) {
      if (uploadedImageUrl) {
        await this.imageStorage.delete(uploadedImageUrl);
      }
      return Result.fail(saveResult.error!);
    }

    if (uploadedImageUrl && previousImageUrl && previousImageUrl !== uploadedImageUrl) {
      await this.imageStorage.delete(previousImageUrl);
    }

    return Result.ok();
  }
}
