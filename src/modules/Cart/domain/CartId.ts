import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export interface CartIdProps {
  value: string;
}

export class CartId extends ValueObject<CartIdProps> {
  private constructor(props: CartIdProps) {
    super(props);
  }

  public static create(value: string): Result<CartId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Cart ID cannot be empty"));
    }
    return Result.ok(new CartId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
