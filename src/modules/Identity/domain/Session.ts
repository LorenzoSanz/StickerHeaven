
import { Entity } from "../../../shared/domain/Entity";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { UserId } from "./UserId";
import { SessionId } from "./SessionId";

export interface SessionProps {
  userId: UserId;
  createdAt: Date;
  expiresAt: Date;
}

export class Session extends Entity<SessionProps, SessionId> {
  private constructor(props: SessionProps, id: SessionId) {
    super(props, id);
  }

  public static create(userId: UserId, durationInSeconds: number = 3600): Result<Session, DomainError> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationInSeconds * 1000);

    const session = new Session({
      userId,
      createdAt: now,
      expiresAt: expiresAt,
    }, SessionId.random());

    return Result.ok(session);
  }

  public static reconstitute(props: SessionProps, id: SessionId): Session {
    return new Session({
      userId: props.userId,
      createdAt: new Date(props.createdAt),
      expiresAt: new Date(props.expiresAt),
    }, id);
  }

  public isValid(): boolean {
    return this.props.expiresAt.getTime() > new Date().getTime();
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get expiresAt(): Date {
    return new Date(this.props.expiresAt);
  }
}
