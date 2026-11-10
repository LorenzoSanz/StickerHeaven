import { SessionQueryService, SessionUserDTO } from "@/modules/Identity/application/queries/SessionQueryService";
import { SessionRepository } from "@/modules/Identity/domain/SessionRepository";

export class IdentitySessionQueryService implements SessionQueryService {
  constructor(
    private sessionRepository: SessionRepository
  ) {}

  async getSessionUser(sessionId: string): Promise<SessionUserDTO | null> {
    const sessionResult = await this.sessionRepository.findById(sessionId);
    if (sessionResult.isFailure || !sessionResult.getValue()) {
      return null;
    }

    const session = sessionResult.getValue()!;
    if (!session.isValid()) {
      return null;
    }

    const userResult = await this.sessionRepository.findUserBySessionId(sessionId);
    if (userResult.isFailure || !userResult.getValue()) {
      return null;
    }

    const user = userResult.getValue()!;
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name.value
    };
  }
}
