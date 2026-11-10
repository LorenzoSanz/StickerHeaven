import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export interface OwnerIdProps {
  value: string;
}

export class OwnerId extends ValueObject<OwnerIdProps> {
  private constructor(props: OwnerIdProps) {
    super(props);
  }

  public static create(value: string): Result<OwnerId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Owner ID cannot be empty"));
    }
    return Result.ok(new OwnerId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
