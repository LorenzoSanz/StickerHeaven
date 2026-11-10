import { describe, it, expect, beforeEach } from "bun:test";
import { LogoutUser } from "./LogoutUser";
import { Session } from "../../domain/Session";
import { UserId } from "../../domain/UserId";
import { SessionId } from "../../domain/SessionId";
import { SessionRepository } from "../../domain/SessionRepository";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { User } from "../../domain/User";

describe("LogoutUser", () => {
  let logoutUser: LogoutUser;
  let sessionRepository: SessionRepository;

  class FakeSessionRepository implements SessionRepository {
    private store = new Map<string, Session>();

    async save(session: Session): Promise<Result<void, DomainError>> {
      this.store.set(session.id.value, session);
      return Result.ok(undefined);
    }

    async findById(sessionId: string): Promise<Result<Session | null, DomainError>> {
      return Result.ok(this.store.get(sessionId) ?? null);
    }

    async delete(sessionId: string): Promise<Result<void, DomainError>> {
      this.store.delete(sessionId);
      return Result.ok(undefined);
    }

    async findUserBySessionId(_sessionId: string): Promise<Result<User | null, DomainError>> {
      return Result.ok(null);
    }
  }

  beforeEach(() => {
    sessionRepository = new FakeSessionRepository();
    logoutUser = new LogoutUser(sessionRepository);
  });

  it("should delete session successfully", async () => {
    // Crea manualmente una sesión en el repositorio
    const userId = UserId.create(crypto.randomUUID()).getValue();
    const sessionResult = Session.create(userId);
    const session = sessionResult.getValue();
    const sessionId = session.id;
    await sessionRepository.save(session);

    const result = await logoutUser.execute(sessionId);

    expect(result.isSuccess).toBe(true);

    const storedSessionResult = await sessionRepository.findById(sessionId.value);
    expect(storedSessionResult.isSuccess).toBe(true);
    expect(storedSessionResult.getValue()).toBeNull();
  });

  it("should succeed even if session does not exist (idempotent)", async () => {
    const sessionId = SessionId.create(crypto.randomUUID()).getValue();
    const result = await logoutUser.execute(sessionId);

    expect(result.isSuccess).toBe(true);
  });
});
