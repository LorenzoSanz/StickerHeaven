import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { v4 as uuidv4, validate as validateUuid } from "uuid";

export interface SessionIdProps {
  value: string;
}

export class SessionId extends ValueObject<SessionIdProps> {
  private constructor(props: SessionIdProps) {
    super(props);
  }

  public static create(value: string): Result<SessionId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Session ID cannot be empty"));
    }
    if (!validateUuid(value)) {
      return Result.fail(new DomainError("Invalid Session ID format (UUID required)"));
    }
    return Result.ok(new SessionId({ value }));
  }

  public static random(): SessionId {
    return new SessionId({ value: uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
