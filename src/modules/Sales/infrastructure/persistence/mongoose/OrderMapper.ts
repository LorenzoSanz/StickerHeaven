/**
 * POR QUÉ: Mapper entre documentos Mongoose y el agregado de dominio Order (reconstitución).
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa de infraestructura - Data Mapper.
 */
import { Order } from "@/modules/Sales/domain/Order";
import { OrderItem } from "@/modules/Sales/domain/OrderItem";
import { OrderStatus } from "@/modules/Sales/domain/OrderStatus";
import { Money } from "@/shared/domain/Money";
import { StickerId } from "@/modules/Sales/domain/StickerId";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { OrderId } from "@/modules/Sales/domain/OrderId";
import { PaymentIntentId } from "@/modules/Sales/domain/PaymentIntentId";
import { IOrderDocument } from "./OrderModel";
import { Quantity } from "@/shared/domain/Quantity";

/**
 * POR QUÉ: Aísla el modelo de persistencia (Mongo/Mongoose) del dominio para mantener dependencias en una sola dirección.
 */
export class OrderMapper {
  public static toDomain(raw: IOrderDocument): Order {
    const items: OrderItem[] = [];
    
    for (const item of raw.items) {
      const priceResult = Money.create(item.unitPrice.amount, item.unitPrice.currency);
      if (priceResult.isFailure) {
          throw new Error(`Invalid item price in DB: ${priceResult.error}`);
      }

      const stickerIdResult = StickerId.create(item.stickerId);
      if (stickerIdResult.isFailure) {
          throw new Error(`Invalid sticker ID in DB: ${stickerIdResult.error}`);
      }

      const quantityResult = Quantity.create(item.quantity);
      if (quantityResult.isFailure) {
          throw new Error(`Invalid quantity in DB: ${item.quantity}`);
      }

      const itemResult = OrderItem.create(
        stickerIdResult.getValue(), 
        item.stickerName || "Producto desconocido", // Fallback para registros antiguos
        item.stickerImageUrl || "", // Fallback para registros antiguos
        quantityResult.getValue(), 
        priceResult.getValue()
      );
      if (itemResult.isSuccess) {
        items.push(itemResult.getValue());
      }
    }

    const statusResult = OrderStatus.create(raw.status);
    if (statusResult.isFailure) {
        throw new Error(`Invalid order status in DB: ${raw.status}`);
    }

    const totalAmountResult = Money.create(raw.totalAmount.amount, raw.totalAmount.currency);
    if (totalAmountResult.isFailure) {
        throw new Error(`Invalid total amount in DB: ${totalAmountResult.error}`);
    }

    const customerIdResult = CustomerId.create(raw.userId);
    if (customerIdResult.isFailure) {
        throw new Error(`Invalid customer ID in DB: ${customerIdResult.error}`);
    }

    const orderIdResult = OrderId.create(raw._id.toString());
    if (orderIdResult.isFailure) {
        throw new Error(`Invalid order ID in DB: ${raw._id}`);
    }

    const paymentIntentId = raw.paymentIntentId 
        ? PaymentIntentId.create(raw.paymentIntentId).getValue() 
        : undefined;

    return Order.reconstitute({
      customerId: customerIdResult.getValue(),
      items,
      totalAmount: totalAmountResult.getValue(),
      status: statusResult.getValue(),
      paymentIntentId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      version: raw.__v ?? 0
    }, orderIdResult.getValue());
  }

  public static toPersistence(order: Order): Partial<IOrderDocument> {
    return {
      _id: order.id.value,
      userId: order.customerId.value,
      items: order.items.map(item => ({
        stickerId: item.stickerId.value,
        stickerName: item.stickerName,
        stickerImageUrl: item.stickerImageUrl,
        quantity: item.quantity.value,
        unitPrice: {
            amount: item.unitPrice.amount,
            currency: item.unitPrice.currency
        },
      })),
      totalAmount: {
          amount: order.totalAmount.amount,
          currency: order.totalAmount.currency
      },
      status: order.status.value,
      paymentIntentId: order.paymentIntentId?.value,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
