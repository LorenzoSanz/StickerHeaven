import { ValueObject } from "./ValueObject";
import { Result } from "./Result";
import { DomainError } from "./DomainError";

export class InvalidQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Quantity must be a positive integer. Got: ${quantity}`);
  }
}

interface QuantityProps {
  value: number;
}

export class Quantity extends ValueObject<QuantityProps> {
  private constructor(props: QuantityProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }
  public static create(value: number): Result<Quantity, InvalidQuantityError> {
    if (!Number.isInteger(value) || value < 1) {
      return Result.fail(new InvalidQuantityError(value));
    }
    return Result.ok(new Quantity({ value }));
  }

  public add(other: Quantity): Result<Quantity, InvalidQuantityError> {
    return Quantity.create(this.value + other.value);
  }

  public subtract(other: Quantity): Result<Quantity, InvalidQuantityError> {
    return Quantity.create(this.value - other.value);
  }
}
