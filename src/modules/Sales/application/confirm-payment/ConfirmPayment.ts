import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderRepository } from "@/modules/Sales/domain/OrderRepository";
import { ILogger } from "@/shared/domain/ILogger";
import { PaymentIntentId } from "@/modules/Sales/domain/PaymentIntentId";
import { OrderStatus } from "@/modules/Sales/domain/OrderStatus";

export interface ConfirmPaymentDTO {
  paymentIntentId: string;
}

export class ConfirmPayment {
  constructor(
    private orderRepository: OrderRepository,
    private logger: ILogger
  ) {}

  async execute(dto: ConfirmPaymentDTO): Promise<Result<void, DomainError>> {
    const paymentIntentIdOrError = PaymentIntentId.create(dto.paymentIntentId);
    if (paymentIntentIdOrError.isFailure) {
         return Result.fail(paymentIntentIdOrError.error!);
    }

    const orderResult = await this.orderRepository.findByPaymentIntentId(paymentIntentIdOrError.getValue());
    if (orderResult.isFailure) return Result.fail(orderResult.error!);
    const order = orderResult.getValue();

    if (!order) {
      return Result.fail(new DomainError(`Order not found for PaymentIntent: ${dto.paymentIntentId}`));
    }

    if (order.status.value === OrderStatus.PAID) {
      this.logger.info(`Order ${order.id.value} already paid. Skipping.`);
      return Result.ok();
    }

    const paidResult = order.markAsPaid();
    if (paidResult.isFailure) {
      return Result.fail(paidResult.error!);
    }

    await this.orderRepository.save(order);
    this.logger.info(`Order ${order.id.value} confirmed as PAID.`);

    return Result.ok();
  }
}
