import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { validate as validateUuid } from "uuid";

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
    if (!validateUuid(value)) {
      return Result.fail(new DomainError("Invalid Owner ID format (UUID required)"));
    }
    return Result.ok(new OwnerId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
