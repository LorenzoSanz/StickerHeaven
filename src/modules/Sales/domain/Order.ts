import { AggregateRoot } from "@/shared/domain/AggregateRoot";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderStatus } from "./OrderStatus";
import { OrderItem } from "./OrderItem";
import { Money } from "@/shared/domain/Money";
import { CustomerId } from "./CustomerId";
import { OrderId } from "./OrderId";
import { PaymentIntentId } from "./PaymentIntentId";
import { OrderPaidEvent } from "./events/OrderPaidEvent";

export interface OrderProps {
  customerId: CustomerId;
  items: OrderItem[];
  totalAmount: Money;
  status: OrderStatus;
  paymentIntentId?: PaymentIntentId;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class Order extends AggregateRoot<OrderProps, OrderId> {
  private constructor(props: OrderProps, id: OrderId) {
    super(props, id);
  }

  public static reconstitute(props: OrderProps, id: OrderId): Order {
    return new Order({
      ...props,
      items: [...props.items],
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    }, id);
  }

  public static create(customerId: CustomerId, items: OrderItem[]): Result<Order, DomainError> {
    if (items.length === 0) {
      return Result.fail(new DomainError("Order must have at least one item"));
    }

    // Determine currency from first item
    const currency = items[0].unitPrice.currency;
    let totalAmount = Money.create(0, currency).getValue();

    for (const item of items) {
       if (item.unitPrice.currency !== currency) {
          return Result.fail(new DomainError("All items must have the same currency"));
       }
       const newTotalOrError = totalAmount.add(item.totalPrice);
       if (newTotalOrError.isFailure) {
          return Result.fail(newTotalOrError.error!);
       }
       totalAmount = newTotalOrError.getValue();
    }

    const order = new Order({
      customerId,
      items,
      totalAmount,
      status: OrderStatus.PendingPayment(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    }, OrderId.random());

    // FUTURE: order.addDomainEvent(new OrderCreatedEvent(order));

    return Result.ok(order);
  }

  get customerId(): CustomerId {
    return this.props.customerId;
  }

  public isOwnedBy(customerId: CustomerId): boolean {
    return this.props.customerId.equals(customerId);
  }

  get items(): OrderItem[] {
    return [...this.props.items];
  }

  get totalAmount(): Money {
    return this.props.totalAmount;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get paymentIntentId(): PaymentIntentId | undefined {
    return this.props.paymentIntentId;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  get version(): number {
    return this.props.version;
  }

  public assignPaymentIntent(id: PaymentIntentId): void {
      this.props.paymentIntentId = id;
      this.props.updatedAt = new Date();
  }

  public markAsPaid(): Result<void, DomainError> {
    if (this.props.status.value === OrderStatus.PAID) {
      return Result.ok(undefined);
    }

    if (
      this.props.status.value === OrderStatus.CANCELLED ||
      this.props.status.value === OrderStatus.SHIPPED ||
      this.props.status.value === OrderStatus.DELIVERED
    ) {
      return Result.fail(new DomainError(`Cannot mark order as paid when status is ${this.props.status.value}`));
    }

    this.props.status = OrderStatus.Paid();
    this.props.updatedAt = new Date();
    this.addDomainEvent(new OrderPaidEvent(this.id, this.customerId, this.totalAmount));
    return Result.ok(undefined);
  }

  public isPaid(): boolean {
    return this.props.status.value === OrderStatus.PAID;
  }

  public isCancelled(): boolean {
    return this.props.status.value === OrderStatus.CANCELLED;
  }

  public isShipped(): boolean {
    return this.props.status.value === OrderStatus.SHIPPED;
  }

  public isDelivered(): boolean {
    return this.props.status.value === OrderStatus.DELIVERED;
  }

  public markAsPaymentFailed(): Result<void, DomainError> {
    if (this.props.status.value === OrderStatus.PAYMENT_FAILED) {
      return Result.ok(undefined);
    }

    if (this.props.status.value !== OrderStatus.PENDING_PAYMENT) {
      return Result.fail(new DomainError(`Cannot mark payment as failed when status is ${this.props.status.value}`));
    }

    this.props.status = OrderStatus.PaymentFailed();
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  public markAsCancelled(): Result<void, DomainError> {
    if (this.props.status.value === OrderStatus.CANCELLED) {
      return Result.ok(undefined);
    }

    if (this.props.status.value === OrderStatus.SHIPPED || this.props.status.value === OrderStatus.DELIVERED) {
      return Result.fail(new DomainError(`Cannot cancel an order when status is ${this.props.status.value}`));
    }

    this.props.status = OrderStatus.Cancelled();
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }
}
