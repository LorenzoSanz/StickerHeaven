
import { SessionRepository } from "../../domain/SessionRepository";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { SessionId } from "../../domain/SessionId";

export class LogoutUser {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionId: SessionId): Promise<Result<void, DomainError>> {
    const result = await this.sessionRepository.delete(sessionId.value);
    if (result.isFailure) {
        return Result.fail(result.error!);
    }
    return Result.ok();
  }
}
