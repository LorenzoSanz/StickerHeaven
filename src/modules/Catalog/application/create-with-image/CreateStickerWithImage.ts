import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import type { StickerRepository } from "@/modules/Catalog/domain/StickerRepository";
import type { IImageStorageService } from "@/modules/Catalog/domain/gateways/IImageStorageService";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";
import { StickerName } from "@/modules/Catalog/domain/StickerName";
import { StickerDescription } from "@/modules/Catalog/domain/StickerDescription";
import { StickerStock } from "@/modules/Catalog/domain/StickerStock";
import { StickerUrl } from "@/modules/Catalog/domain/StickerUrl";
import { StickerTag } from "@/modules/Catalog/domain/StickerTag";
import { Money } from "@/shared/domain/Money";
import { StickerOwnerAssignmentPolicy } from "@/modules/Catalog/application/policies/StickerOwnerAssignmentPolicy";

export type CreateStickerWithImageDTO = {
  ownerId: string;
  requesterId: string;
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  stock: number;
  tags: string[];
  image: { buffer: Buffer; filename?: string };
};

export class CreateStickerWithImage {
  constructor(
    private stickerRepository: StickerRepository,
    private imageStorage: IImageStorageService,
    private stickerOwnerAssignmentPolicy: StickerOwnerAssignmentPolicy = new StickerOwnerAssignmentPolicy()
  ) {}

  async execute(dto: CreateStickerWithImageDTO): Promise<Result<{ id: string }, DomainError>> {
    const ownerIdOrError = OwnerId.create(dto.ownerId);
    if (ownerIdOrError.isFailure) return Result.fail(ownerIdOrError.error!);

    const requesterIdOrError = OwnerId.create(dto.requesterId);
    if (requesterIdOrError.isFailure) return Result.fail(requesterIdOrError.error!);

    const ownerPolicyResult = this.stickerOwnerAssignmentPolicy.assertSameOwner(
      ownerIdOrError.getValue(),
      requesterIdOrError.getValue()
    );
    if (ownerPolicyResult.isFailure) return Result.fail(ownerPolicyResult.error!);

    const nameOrError = StickerName.create(dto.name);
    if (nameOrError.isFailure) return Result.fail(nameOrError.error!);

    const descriptionOrError = StickerDescription.create(dto.description);
    if (descriptionOrError.isFailure) return Result.fail(descriptionOrError.error!);

    const priceOrError = Money.create(dto.priceAmount, dto.priceCurrency);
    if (priceOrError.isFailure) return Result.fail(priceOrError.error!);

    const stockOrError = StickerStock.create(dto.stock);
    if (stockOrError.isFailure) return Result.fail(stockOrError.error!);

    for (const rawTag of dto.tags ?? []) {
      const tagOrError = StickerTag.create(rawTag);
      if (tagOrError.isFailure) return Result.fail(tagOrError.error!);
    }

    if (!dto.image?.buffer || dto.image.buffer.length === 0) {
      return Result.fail(new DomainError("La imagen es obligatoria"));
    }

    const uploadResult = await this.imageStorage.upload(dto.image.buffer, dto.image.filename);
    if (uploadResult.isFailure) return Result.fail(uploadResult.error!);

    const imageUrl = uploadResult.getValue();
    const imageUrlOrError = StickerUrl.create(imageUrl);
    if (imageUrlOrError.isFailure) return Result.fail(imageUrlOrError.error!);

    const stickerOrError = Sticker.create(
      ownerIdOrError.getValue(),
      nameOrError.getValue(),
      descriptionOrError.getValue(),
      priceOrError.getValue(),
      stockOrError.getValue(),
      imageUrlOrError.getValue(),
      dto.tags
    );
    if (stickerOrError.isFailure) return Result.fail(stickerOrError.error!);

    const sticker = stickerOrError.getValue();
    const saveResult = await this.stickerRepository.save(sticker);
    if (saveResult.isFailure) {
      await this.imageStorage.delete(imageUrl);
      return Result.fail(saveResult.error!);
    }

    return Result.ok({ id: sticker.id.value });
  }
}
