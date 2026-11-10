import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { v4 as uuidv4 } from "uuid";

export interface OrderIdProps {
  value: string;
}

export class OrderId extends ValueObject<OrderIdProps> {
  private constructor(props: OrderIdProps) {
    super(props);
  }

  public static create(value: string): Result<OrderId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Order ID cannot be empty"));
    }
    return Result.ok(new OrderId({ value }));
  }

  public static random(): OrderId {
    return new OrderId({ value: uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
