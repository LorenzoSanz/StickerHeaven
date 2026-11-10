import { describe, it, expect } from "bun:test";
import { Order } from "./Order";
import { OrderItem } from "./OrderItem";
import { Money } from "../../../shared/domain/Money";
import { CustomerId } from "./CustomerId";
import { OrderId } from "./OrderId";
import { StickerId } from "./StickerId";
import { Quantity } from "../../../shared/domain/Quantity";
import { OrderStatus } from "./OrderStatus";

const qty = (n: number) => Quantity.create(n).getValue();

describe("Order Aggregate", () => {
  const userId = CustomerId.create("user-123").getValue();
  const tenEuros = Money.create(10, "EUR").getValue();
  const twentyEuros = Money.create(20, "EUR").getValue();
  
  const item1 = OrderItem.create(StickerId.create("sticker-1").getValue(), "Sticker 1", "http://img/1", qty(2), tenEuros).getValue();
  const item2 = OrderItem.create(StickerId.create("sticker-2").getValue(), "Sticker 2", "http://img/2", qty(1), twentyEuros).getValue();

  it("should create a valid Order", () => {
    const orderResult = Order.create(userId, [item1, item2]);

    expect(orderResult.isSuccess).toBe(true);
    const order = orderResult.getValue();
    expect(order.customerId.value).toBe("user-123");
    expect(order.items.length).toBe(2);
    expect(order.totalAmount.amount).toBe(40); // (2*10) + (1*20)
    expect(order.totalAmount.currency).toBe("EUR");
    expect(order.status.value).toBe("PENDING_PAYMENT");
    expect(order.id).toBeInstanceOf(OrderId);
    expect(order.version).toBe(0);
  });

  it("should fail to create order with no items", () => {
    const orderResult = Order.create(userId, []);
    expect(orderResult.isFailure).toBe(true);
    expect(orderResult.error?.message).toBe("Order must have at least one item");
  });

  it("should fail to create order with mixed currencies", () => {
    const tenUsd = Money.create(10, "USD").getValue();
    const itemUsd = OrderItem.create(StickerId.create("sticker-3").getValue(), "Sticker USD", "http://img/3", qty(1), tenUsd).getValue();
    
    const orderResult = Order.create(userId, [item1, itemUsd]);
    expect(orderResult.isFailure).toBe(true);
    expect(orderResult.error?.message).toBe("All items must have the same currency");
  });

  it("should mark order as paid", () => {
    const order = Order.create(userId, [item1]).getValue();
    const paidResult = order.markAsPaid();
    expect(paidResult.isSuccess).toBe(true);
    expect(order.status.value).toBe("PAID");
  });

  it("should not allow marking a cancelled order as paid", () => {
    const order = Order.create(userId, [item1]).getValue();
    const cancelResult = order.markAsCancelled();
    expect(cancelResult.isSuccess).toBe(true);

    const paidResult = order.markAsPaid();
    expect(paidResult.isFailure).toBe(true);
  });

  it("should not allow cancelling a shipped order", () => {
    const base = Order.create(userId, [item1]).getValue();
    const shipped = Order.reconstitute(
      {
        customerId: base.customerId,
        items: base.items,
        totalAmount: base.totalAmount,
        status: OrderStatus.Shipped(),
        paymentIntentId: base.paymentIntentId,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
        version: base.version,
      },
      base.id
    );

    const cancelResult = shipped.markAsCancelled();
    expect(cancelResult.isFailure).toBe(true);
  });

  it("should allow cancelling a paid order before shipping", () => {
    const order = Order.create(userId, [item1]).getValue();
    expect(order.markAsPaid().isSuccess).toBe(true);

    const cancelResult = order.markAsCancelled();
    expect(cancelResult.isSuccess).toBe(true);
    expect(order.status.value).toBe("CANCELLED");
  });
});
