import { DomainEventSubscriber } from "@/shared/infrastructure/events/DomainEventPublisher";
import { DomainEvent } from "@/shared/domain/DomainEvent";
import { OrderPaidEvent } from "@/modules/Sales/domain/events/OrderPaidEvent";
import { IEmailService } from "@/shared/domain/IEmailService";
import { ILogger } from "@/shared/domain/ILogger";
import { UserContactQueryService } from "@/shared/contracts/UserContactQueryService";

export class OrderPaidSubscriber implements DomainEventSubscriber {
  constructor(
    private emailService: IEmailService,
    private userContactQueryService: UserContactQueryService,
    private logger: ILogger
  ) {}

  subscribedTo(): string[] {
    return ["Sales.OrderPaid"];
  }

  async on(event: DomainEvent): Promise<void> {
    if (!(event instanceof OrderPaidEvent)) return;
    const { orderId, customerId, totalAmount } = event;

    // 1. Fetch User to get email
    const userEmailResult = await this.userContactQueryService.getEmailByUserId(customerId.value);
    if (userEmailResult.isFailure || !userEmailResult.getValue()) {
      this.logger.error("Failed to resolve email for order confirmation", { userId: customerId.value });
      return;
    }

    const email = userEmailResult.getValue()!;

    // 2. Send Email
    const emailResult = await this.emailService.sendOrderConfirmation(
      email,
      orderId.value,
      totalAmount.amount,
      totalAmount.currency
    );

    if (emailResult.isFailure) {
      this.logger.error("Failed to send order confirmation email", {
        userId: customerId.value,
        orderId: orderId.value,
        error: emailResult.error,
      });
    } else {
      this.logger.info("Order confirmation email sent", { userId: customerId.value, orderId: orderId.value });
    }
  }
}
