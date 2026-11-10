import { Session } from "./Session";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

import { User } from "./User";

export interface SessionRepository {
  save(session: Session): Promise<Result<void, DomainError>>;
  findById(sessionId: string): Promise<Result<Session | null, DomainError>>;
  delete(sessionId: string): Promise<Result<void, DomainError>>;
  deleteAllForUserExcept(userId: string, keepSessionId: string | null): Promise<Result<void, DomainError>>;
  findUserBySessionId(sessionId: string): Promise<Result<User | null, DomainError>>;
}
