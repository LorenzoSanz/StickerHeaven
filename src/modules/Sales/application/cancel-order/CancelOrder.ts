import { OrderRepository } from "../../domain/OrderRepository";
import { PaymentGateway } from "../../domain/gateways/PaymentGateway";
import { CatalogGateway } from "../gateways/CatalogGateway";
import { CancelOrderDTO } from "./CancelOrderDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderId } from "../../domain/OrderId";
import { OrderStatus } from "../../domain/OrderStatus";
import { ILogger } from "@/shared/domain/ILogger";
import { CustomerId } from "../../domain/CustomerId";
import { OrderAccessPolicy } from "../policies/OrderAccessPolicy";
import { OrderAlreadyCancelledError, OrderNotCancellableError, OrderNotFoundError } from "../../domain/Errors";

export class CancelOrder {
  constructor(
    private orderRepository: OrderRepository,
    private paymentGateway: PaymentGateway,
    private catalogGateway: CatalogGateway,
    private logger: ILogger,
    private orderAccessPolicy: OrderAccessPolicy = new OrderAccessPolicy()
  ) {}

  async execute(dto: CancelOrderDTO): Promise<Result<void, DomainError>> {
    const orderIdOrError = OrderId.create(dto.orderId);
    if (orderIdOrError.isFailure) return Result.fail(orderIdOrError.error!);
    const orderId = orderIdOrError.getValue();

    const orderResult = await this.orderRepository.findById(orderId);
    if (orderResult.isFailure) return Result.fail(orderResult.error!);
    const order = orderResult.getValue();

    if (!order) {
      return Result.fail(new OrderNotFoundError());
    }

    const customerIdOrError = CustomerId.create(dto.userId);
    if (customerIdOrError.isFailure) return Result.fail(customerIdOrError.error!);
    const accessResult = this.orderAccessPolicy.assertOwner(order, customerIdOrError.getValue());
    if (accessResult.isFailure) return Result.fail(accessResult.error!);

    // Validación de estado (reglas de dominio a nivel de aplicación).
    if (order.status.value === OrderStatus.CANCELLED) {
      return Result.fail(new OrderAlreadyCancelledError());
    }
    if (order.status.value === OrderStatus.SHIPPED || order.status.value === OrderStatus.DELIVERED) {
      return Result.fail(new OrderNotCancellableError());
    }

    // Reembolso/cancelación según estado de pago.
    if (order.status.value === OrderStatus.PAID && order.paymentIntentId) {
       const refundResult = await this.paymentGateway.refundPayment(order.paymentIntentId.value);
       if (refundResult.isFailure) {
           this.logger.error("Refund failed", { orderId: dto.orderId, error: refundResult.error });
           return Result.fail(new DomainError("No se pudo procesar el reembolso. Cancelación abortada."));
       }
    } else if (order.status.value === OrderStatus.PENDING_PAYMENT && order.paymentIntentId) {
        // Si está pendiente, basta con cancelar el intent
        await this.paymentGateway.cancelPaymentIntent(order.paymentIntentId.value);
    }

    // Reponer stock (best-effort): si falla, registramos para corrección manual pero no bloqueamos la cancelación.
    for (const item of order.items) {
        const restoreResult = await this.catalogGateway.restoreStock(item.stickerId, item.quantity.value);
        if (restoreResult.isFailure) {
            this.logger.error("Failed to restore stock during cancellation", { stickerId: item.stickerId.value, error: restoreResult.error });
        }
    }

    const cancelResult = order.markAsCancelled();
    if (cancelResult.isFailure) {
      return Result.fail(cancelResult.error!);
    }
    return await this.orderRepository.save(order);
  }
}
