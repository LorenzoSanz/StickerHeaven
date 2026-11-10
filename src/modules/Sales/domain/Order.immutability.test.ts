import { describe, expect, it } from "bun:test";
import { Order } from "./Order";
import { OrderId } from "./OrderId";
import { OrderStatus } from "./OrderStatus";
import { OrderItem } from "./OrderItem";
import { CustomerId } from "./CustomerId";
import { StickerId } from "@/shared/domain/StickerId";
import { Money } from "@/shared/domain/Money";
import { Quantity } from "@/shared/domain/Quantity";

describe("Order immutability", () => {
  it("does not expose mutable Date references", () => {
    const customerId = CustomerId.create("c1").getValue();
    const item = OrderItem.create(
      StickerId.create(crypto.randomUUID()).getValue(),
      "Sticker",
      "https://example.com/sticker.png",
      Quantity.create(1).getValue(),
      Money.create(10, "USD").getValue()
    ).getValue();

    const createdAt = new Date("2020-01-01T00:00:00.000Z");
    const updatedAt = new Date("2020-01-01T00:10:00.000Z");

    const order = Order.reconstitute(
      {
        customerId,
        items: [item],
        totalAmount: Money.create(10, "USD").getValue(),
        status: OrderStatus.PendingPayment(),
        createdAt,
        updatedAt,
        version: 0,
      },
      OrderId.random()
    );

    const leakedCreatedAt = order.createdAt;
    leakedCreatedAt.setTime(0);
    expect(order.createdAt.toISOString()).toBe("2020-01-01T00:00:00.000Z");

    const leakedUpdatedAt = order.updatedAt;
    leakedUpdatedAt.setTime(0);
    expect(order.updatedAt.toISOString()).toBe("2020-01-01T00:10:00.000Z");
  });
});

