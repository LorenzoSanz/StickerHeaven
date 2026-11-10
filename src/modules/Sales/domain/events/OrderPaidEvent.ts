import { DomainEvent } from "../../../../shared/domain/DomainEvent";
import { OrderId } from "../OrderId";
import { CustomerId } from "../CustomerId";
import { Money } from "../../../../shared/domain/Money";

export class OrderPaidEvent implements DomainEvent {
  public occurredOn: Date;
  public eventId: string;
  public eventName: string = "Sales.OrderPaid";

  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly totalAmount: Money
  ) {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
  }
}
