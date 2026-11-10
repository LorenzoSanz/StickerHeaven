import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OwnerId } from "../../domain/OwnerId";
import { StickerOwnershipError } from "../../domain/Errors";

export class StickerOwnerAssignmentPolicy {
  assertSameOwner(ownerId: OwnerId, requesterId: OwnerId): Result<void, DomainError> {
    if (!ownerId.equals(requesterId)) {
      return Result.fail(new StickerOwnershipError());
    }
    return Result.ok<void, DomainError>();
  }
}
