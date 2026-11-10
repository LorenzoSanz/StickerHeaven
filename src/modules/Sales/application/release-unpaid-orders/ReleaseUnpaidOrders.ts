import { OrderRepository } from "../../domain/OrderRepository";
import { PaymentGateway } from "../../domain/gateways/PaymentGateway";
import { CatalogGateway } from "../gateways/CatalogGateway";
import { Order } from "../../domain/Order";
import { PaymentIntentId } from "../../domain/PaymentIntentId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { ILogger } from "@/shared/domain/ILogger";

export interface ReleaseSummary {
  released: number;
  skipped: number;
}

/**
 * Stock is reserved when an order is created, before the customer pays. Orders that are never
 * paid would keep that stock forever, so a logged-in user could empty a product by starting
 * checkouts. This use case cancels such orders and gives their stock back.
 *
 * Order of steps matters:
 * 1. Cancel the PaymentIntent first. If Stripe already charged it, the cancel fails and the
 *    order is left alone for the payment_intent.succeeded webhook to mark as paid.
 * 2. Save the cancelled order with optimistic locking, so two runs (or a run and a webhook)
 *    cannot both win.
 * 3. Restore stock only after the save succeeded, so it is never restored twice.
 */
export class ReleaseUnpaidOrders {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly catalogGateway: CatalogGateway,
    private readonly logger: ILogger,
    private readonly now: () => Date = () => new Date()
  ) {}

  async execute(maxAgeMs: number, batchSize = 50): Promise<Result<ReleaseSummary, DomainError>> {
    const cutoff = new Date(this.now().getTime() - maxAgeMs);
    const ordersResult = await this.orderRepository.findPendingPaymentCreatedBefore(cutoff, batchSize);
    if (ordersResult.isFailure) return Result.fail(ordersResult.error!);

    const summary: ReleaseSummary = { released: 0, skipped: 0 };
    for (const order of ordersResult.getValue()) {
      const released = await this.release(order, { cancelPaymentIntent: true });
      if (released) summary.released += 1;
      else summary.skipped += 1;
    }
    if (summary.released || summary.skipped) {
      this.logger.info("Released unpaid orders", { ...summary, cutoff: cutoff.toISOString() });
    }
    return Result.ok(summary);
  }

  /** Called when Stripe reports the PaymentIntent as canceled: the intent is already gone. */
  async releaseByPaymentIntent(paymentIntentId: string): Promise<Result<boolean, DomainError>> {
    const idResult = PaymentIntentId.create(paymentIntentId);
    if (idResult.isFailure) return Result.fail(idResult.error!);

    const orderResult = await this.orderRepository.findByPaymentIntentId(idResult.getValue());
    if (orderResult.isFailure) return Result.fail(orderResult.error!);
    const order = orderResult.getValue();
    if (!order || order.isPaid() || order.isCancelled()) return Result.ok(false);

    return Result.ok(await this.release(order, { cancelPaymentIntent: false }));
  }

  private async release(order: Order, options: { cancelPaymentIntent: boolean }): Promise<boolean> {
    const orderId = order.id.value;

    if (options.cancelPaymentIntent && order.paymentIntentId) {
      const cancelResult = await this.paymentGateway.cancelPaymentIntent(order.paymentIntentId.value);
      if (cancelResult.isFailure) {
        this.logger.warn("Could not cancel PaymentIntent; leaving order untouched", {
          orderId,
          error: cancelResult.error?.message,
        });
        return false;
      }
    }

    const cancelResult = order.markAsCancelled();
    if (cancelResult.isFailure) return false;

    const saveResult = await this.orderRepository.save(order);
    if (saveResult.isFailure) {
      this.logger.warn("Order changed while releasing it; stock not restored", { orderId });
      return false;
    }

    for (const item of order.items) {
      const restoreResult = await this.catalogGateway.restoreStock(item.stickerId, item.quantity.value);
      if (restoreResult.isFailure) {
        this.logger.error("Failed to restore stock for released order", {
          orderId,
          stickerId: item.stickerId.value,
          error: restoreResult.error?.message,
        });
      }
    }
    return true;
  }
}
