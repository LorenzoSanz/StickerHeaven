import { DomainEventSubscriber } from "@/shared/infrastructure/events/DomainEventPublisher";
import { DomainEvent } from "@/shared/domain/DomainEvent";
import { OrderPaidEvent } from "@/modules/Sales/domain/events/OrderPaidEvent";
import { ILogger } from "@/shared/domain/ILogger";
import { CartGateway } from "@/modules/Sales/domain/gateways/CartGateway";

export class ClearCartOnOrderPaidSubscriber implements DomainEventSubscriber {
  constructor(
    private readonly cartGateway: CartGateway,
    private readonly logger: ILogger
  ) {}

  subscribedTo(): string[] {
    return ["Sales.OrderPaid"];
  }

  async on(event: DomainEvent): Promise<void> {
    if (!(event instanceof OrderPaidEvent)) return;

    const result = await this.cartGateway.clearCart(event.customerId.value, null);
    if (result.isFailure) {
      this.logger.error("Failed to clear cart after order paid", {
        userId: event.customerId.value,
        orderId: event.orderId.value,
        error: result.error,
      });
      return;
    }

    this.logger.info("Cleared cart after order paid", {
      userId: event.customerId.value,
      orderId: event.orderId.value,
    });
  }
}
