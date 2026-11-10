import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface CustomerIdProps {
  value: string;
}

export class CustomerId extends ValueObject<CustomerIdProps> {
  private constructor(props: CustomerIdProps) {
    super(props);
  }

  public static create(value: string): Result<CustomerId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Customer ID cannot be empty"));
    }
    return Result.ok(new CustomerId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
