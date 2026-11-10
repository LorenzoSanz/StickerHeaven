import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";
import { StickerOwnershipError } from "@/modules/Catalog/domain/Errors";

export class StickerOwnershipPolicy {
  assertOwner(sticker: Sticker, ownerId: OwnerId): Result<void, DomainError> {
    if (!sticker.isOwnedBy(ownerId)) {
      return Result.fail(new StickerOwnershipError());
    }
    return Result.ok(undefined);
  }
}
