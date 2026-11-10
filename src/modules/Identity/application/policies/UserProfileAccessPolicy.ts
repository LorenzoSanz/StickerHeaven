import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserId } from "../../domain/UserId";

class UnauthorizedUserProfileAccessError extends DomainError {
  constructor() {
    super("No autorizado");
  }
}

export class UserProfileAccessPolicy {
  assertSelf(targetUserId: UserId, requesterId: UserId): Result<void, DomainError> {
    if (!targetUserId.equals(requesterId)) {
      return Result.fail(new UnauthorizedUserProfileAccessError());
    }
    return Result.ok<void, DomainError>();
  }
}
