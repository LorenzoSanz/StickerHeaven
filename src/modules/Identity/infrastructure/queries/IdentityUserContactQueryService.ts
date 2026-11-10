import { UserContactQueryService } from "@/shared/contracts/UserContactQueryService";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserRepository } from "../../domain/UserRepository";
import { UserId } from "../../domain/UserId";

export class IdentityUserContactQueryService implements UserContactQueryService {
  constructor(private readonly userRepository: UserRepository) {}

  async getEmailByUserId(userId: string): Promise<Result<string | null, DomainError>> {
    const userIdOrError = UserId.create(userId);
    if (userIdOrError.isFailure) {
      return Result.fail(userIdOrError.error!);
    }

    const userResult = await this.userRepository.findById(userIdOrError.getValue());
    if (userResult.isFailure) {
      return Result.fail(userResult.error!);
    }

    const user = userResult.getValue();
    if (!user) {
      return Result.ok<string | null, DomainError>(null);
    }

    return Result.ok<string | null, DomainError>(user.email.value);
  }
}
