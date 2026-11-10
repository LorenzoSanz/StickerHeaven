
import { Session, SessionProps } from "../../../domain/Session";
import { SessionDocument } from "./SessionModel";
import { SessionId } from "../../../domain/SessionId";
import { UserId } from "../../../domain/UserId";

export class SessionMapper {
  static toDomain(raw: SessionDocument): Session {
    return Session.reconstitute({
        userId: UserId.create(raw.userId).getValue(),
        createdAt: raw.createdAt,
        expiresAt: raw.expiresAt,
    }, SessionId.create(raw._id).getValue());
  }

  static toPersistence(session: Session): SessionDocument {
    return {
        _id: session.id.value,
        userId: session.userId.value,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
    } as SessionDocument;
  }
}
