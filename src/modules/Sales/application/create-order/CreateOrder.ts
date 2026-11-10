import { OrderRepository } from "@/modules/Sales/domain/OrderRepository";
import { CatalogGateway, ProductInfo } from "../gateways/CatalogGateway";
import { PaymentGateway } from "../../domain/gateways/PaymentGateway";
import { CartGateway } from "../../domain/gateways/CartGateway";
import { CreateOrderDTO } from "./CreateOrderDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Order } from "../../domain/Order";
import { OrderItem } from "../../domain/OrderItem";
import { CustomerId } from "../../domain/CustomerId";
import { Money } from "@/shared/domain/Money";

import { StickerId } from "../../domain/StickerId";
import { ILogger } from "@/shared/domain/ILogger";
import { PaymentIntentId } from "../../domain/PaymentIntentId";
import { Quantity } from "@/shared/domain/Quantity";
import { InsufficientStockError, ProductNotFoundError, UserIdRequiredToCreateOrderError } from "../../domain/Errors";

export class CreateOrder {
  constructor(
    private orderRepository: OrderRepository,
    private catalogGateway: CatalogGateway,
    private paymentGateway: PaymentGateway,
    private cartGateway: CartGateway,
    private logger: ILogger
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Result<{ id: string; clientSecret: string }, DomainError>> {
    const orderItems: OrderItem[] = [];

    if (!dto.userId) {
        return Result.fail(new UserIdRequiredToCreateOrderError());
    }
    const customerIdOrError = CustomerId.create(dto.userId);
    if (customerIdOrError.isFailure) {
      return Result.fail(customerIdOrError.error!);
    }
    const customerId = customerIdOrError.getValue();

    const stickerIds: StickerId[] = [];
    for (const item of dto.items) {
      const idOrError = StickerId.create(item.stickerId);
      if (idOrError.isFailure) return Result.fail(idOrError.error!);
      stickerIds.push(idOrError.getValue());
    }

    // Dedupe para evitar pedir el mismo producto múltiples veces al catálogo.
    const uniqueStickerIds = Array.from(new Map(stickerIds.map(id => [id.value, id])).values());
    
    const productsResult = await this.catalogGateway.getProductsInfo(uniqueStickerIds);
    
    if (productsResult.isFailure) {
      return Result.fail(productsResult.error!);
    }

    const products = productsResult.getValue();
    const productsMap = new Map<string, ProductInfo>(products.map((p) => [p.id, p]));

    for (const itemDto of dto.items) {
      const product = productsMap.get(itemDto.stickerId);
      
      if (!product) {
        return Result.fail(new ProductNotFoundError(itemDto.stickerId));
      }

      if (product.stock < itemDto.quantity) {
        return Result.fail(new InsufficientStockError(itemDto.stickerId, itemDto.quantity, product.stock));
      }

      if (!product.name || !product.imageUrl) {
        return Result.fail(new DomainError(`Product details missing for ${itemDto.stickerId}`));
      }

      const priceResult = Money.create(product.priceAmount, product.priceCurrency);
      if (priceResult.isFailure) {
        return Result.fail(priceResult.error!);
      }

      const quantityResult = Quantity.create(itemDto.quantity);
      if (quantityResult.isFailure) {
        return Result.fail(quantityResult.error!);
      }
      const quantityVO = quantityResult.getValue();

      const stickerId = StickerId.create(itemDto.stickerId).getValue();

      const orderItemOrError = OrderItem.create(
        stickerId,
        product.name,
        product.imageUrl,
        quantityVO,
        priceResult.getValue()
      );

      if (orderItemOrError.isFailure) {
        return Result.fail(orderItemOrError.error!);
      }

      orderItems.push(orderItemOrError.getValue());
    }

    const orderOrError = Order.create(customerId, orderItems);

    if (orderOrError.isFailure) {
      return Result.fail(orderOrError.error!);
    }

    const order = orderOrError.getValue();

    const paymentIntentResult = await this.paymentGateway.createPaymentIntent(order.totalAmount, {
        orderId: order.id.value,
        userId: customerId.value
    });

    if (paymentIntentResult.isFailure) {
        this.logger.error("Failed to create payment intent", paymentIntentResult.error);
        return Result.fail(paymentIntentResult.error!);
    }

    const { id: paymentIntentIdRaw, clientSecret } = paymentIntentResult.getValue();
    
    const paymentIntentIdOrError = PaymentIntentId.create(paymentIntentIdRaw);
    if (paymentIntentIdOrError.isFailure) {
         this.logger.error("Invalid payment intent ID received from gateway", paymentIntentIdOrError.error);
         return Result.fail(paymentIntentIdOrError.error!);
    }
    const paymentIntentId = paymentIntentIdOrError.getValue();

    order.assignPaymentIntent(paymentIntentId);

    await this.orderRepository.save(order);

    const reduceStockResult = await this.reduceStockSequentially(orderItems);
    
    if (reduceStockResult.isFailure) {
      this.logger.error("Stock reduction failed, compensating...", reduceStockResult.error);
      
      // Compensación 1: Cancelar payment intent
      await this.paymentGateway.cancelPaymentIntent(paymentIntentId.value);

      // Compensación 2: Cancelar pedido
      const cancelResult = order.markAsCancelled();
      if (cancelResult.isFailure) {
        return Result.fail(cancelResult.error!);
      }
      await this.orderRepository.save(order);
      
      return Result.fail(new DomainError("Order failed due to stock issues (cancelled)"));
    }

    return Result.ok({ id: order.id.value, clientSecret });
  }

  private async reduceStockSequentially(orderItems: OrderItem[]): Promise<Result<void, DomainError>> {
    const reducedItems: OrderItem[] = [];

    for (const item of orderItems) {
        const result = await this.catalogGateway.reduceStock(item.stickerId, item.quantity.value);
        if (result.isFailure) {
           // Iniciamos compensación: restaurar los items ya reducidos antes del fallo.
           await this.rollbackStock(reducedItems);
           return Result.fail(new DomainError(`Failed to reduce stock for item ${item.stickerId.value}: ${result.error}`));
        }
        reducedItems.push(item);
    }
    return Result.ok();
  }

  /**
   * Acción compensatoria: restaura stock para los items que ya se habían reducido antes de un fallo.
   */
  private async rollbackStock(items: OrderItem[]): Promise<void> {
      // Iteramos en orden inverso por seguridad (aunque restore es conmutativo en la práctica).
      for (const item of items) {
          try {
              const result = await this.catalogGateway.restoreStock(item.stickerId, item.quantity.value);
              if (result.isFailure) {
                  this.logger.error(`CRITICAL: Failed to compensate stock for item ${item.stickerId.value}: ${result.error}`);
                  // We continue to try restoring other items.
              }
          } catch (error) {
              this.logger.error(`CRITICAL: Exception during stock compensation for item ${item.stickerId.value}:`, error);
              // We continue to try restoring other items.
          }
      }
  }
}
