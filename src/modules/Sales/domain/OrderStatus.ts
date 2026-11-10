import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export type OrderStatusType = "PENDING_PAYMENT" | "PAID" | "PAYMENT_FAILED" | "CANCELLED" | "SHIPPED" | "DELIVERED";

interface OrderStatusProps {
  value: OrderStatusType;
}

export class InvalidOrderStatusError extends DomainError {
  constructor(status: string) {
    super(`Invalid order status: ${status}`);
  }
}

export class OrderStatus extends ValueObject<OrderStatusProps> {
  public static readonly PENDING_PAYMENT = "PENDING_PAYMENT";
  public static readonly PAID = "PAID";
  public static readonly PAYMENT_FAILED = "PAYMENT_FAILED";
  public static readonly CANCELLED = "CANCELLED";
  public static readonly SHIPPED = "SHIPPED";
  public static readonly DELIVERED = "DELIVERED"; // Added missing one based on CancelOrder usage

  private constructor(props: OrderStatusProps) {
    super(props);
  }

  get value(): OrderStatusType {
    return this.props.value;
  }

  public static create(status: string): Result<OrderStatus, InvalidOrderStatusError> {
    const validStatuses = [
      OrderStatus.PENDING_PAYMENT, 
      OrderStatus.PAID, 
      OrderStatus.PAYMENT_FAILED, 
      OrderStatus.CANCELLED, 
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED
    ];
    if (!validStatuses.includes(status)) {
      return Result.fail(new InvalidOrderStatusError(status));
    }
    return Result.ok(new OrderStatus({ value: status as OrderStatusType }));
  }

  public static PendingPayment(): OrderStatus {
    return new OrderStatus({ value: OrderStatus.PENDING_PAYMENT });
  }

  public static Paid(): OrderStatus {
    return new OrderStatus({ value: OrderStatus.PAID });
  }

  public static PaymentFailed(): OrderStatus {
    return new OrderStatus({ value: OrderStatus.PAYMENT_FAILED });
  }

  public static Cancelled(): OrderStatus {
    return new OrderStatus({ value: OrderStatus.CANCELLED });
  }

  public static Shipped(): OrderStatus {
    return new OrderStatus({ value: OrderStatus.SHIPPED });
  }
  
  public static Delivered(): OrderStatus {
    return new OrderStatus({ value: OrderStatus.DELIVERED });
  }
}
