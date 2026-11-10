
import { SessionRepository } from "../../../domain/SessionRepository";
import { Session } from "../../../domain/Session";
import { SessionModel, SessionDocument } from "./SessionModel";
import { SessionMapper } from "./SessionMapper";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

import { User } from "../../../domain/User";
import { UserModel, UserDocument } from "./UserModel";
import { UserMapper } from "./UserMapper";

export class MongoSessionRepository implements SessionRepository {
  async save(session: Session): Promise<Result<void, DomainError>> {
    try {
      const raw = SessionMapper.toPersistence(session);
      await SessionModel.findOneAndUpdate(
        { _id: raw._id },
        raw,
        { upsert: true, new: true }
      );
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to save session: ${error}`));
    }
  }

  async findById(sessionId: string): Promise<Result<Session | null, DomainError>> {
    try {
      const raw = await SessionModel.findOne({ _id: sessionId }).lean<SessionDocument>();
      if (!raw) return Result.ok(null);
      return Result.ok(SessionMapper.toDomain(raw));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find session: ${error}`));
    }
  }

  async delete(sessionId: string): Promise<Result<void, DomainError>> {
    try {
      await SessionModel.deleteOne({ _id: sessionId });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to delete session: ${error}`));
    }
  }

  async deleteAllForUserExcept(userId: string, keepSessionId: string | null): Promise<Result<void, DomainError>> {
    try {
      const filter = keepSessionId ? { userId, _id: { $ne: keepSessionId } } : { userId };
      await SessionModel.deleteMany(filter);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to delete user sessions: ${error}`));
    }
  }

  async findUserBySessionId(sessionId: string): Promise<Result<User | null, DomainError>> {
    try {
      const sessionRaw = await SessionModel.findOne({ _id: sessionId }).lean<SessionDocument>();
      if (!sessionRaw) return Result.ok(null);
      
      const userRaw = await UserModel.findOne({ _id: sessionRaw.userId }).lean<UserDocument>();
      if (!userRaw) return Result.ok(null);

      return Result.ok(UserMapper.toDomain(userRaw));
    } catch (error) {
        return Result.fail(new DomainError(`Failed to find user by session: ${error}`));
    }
  }
}
