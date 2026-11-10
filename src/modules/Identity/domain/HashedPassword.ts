import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface HashedPasswordProps {
  value: string;
}

export class HashedPassword extends ValueObject<HashedPasswordProps> {
  private constructor(props: HashedPasswordProps) {
    super(props);
  }

  public static create(value: string): Result<HashedPassword, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Hashed password cannot be empty"));
    }
    return Result.ok(new HashedPassword({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
