import { describe, it, expect } from "bun:test";
import { ClearCartOnOrderPaidSubscriber } from "./ClearCartOnOrderPaidSubscriber";
import { OrderPaidEvent } from "@/modules/Sales/domain/events/OrderPaidEvent";
import { OrderId } from "@/modules/Sales/domain/OrderId";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { Money } from "@/shared/domain/Money";
import { Result } from "@/shared/domain/Result";

describe("ClearCartOnOrderPaidSubscriber", () => {
  it("should clear cart for customer when order is paid", async () => {
    let calledWith: { userId: string | null; anonymousId: string | null } | null = null;

    const subscriber = new ClearCartOnOrderPaidSubscriber(
      {
        clearCart: async (userId: string | null, anonymousId: string | null) => {
          calledWith = { userId, anonymousId };
          return Result.ok();
        },
        getCartSnapshot: async () => Result.fail(new Error("not used") as any),
      } as any,
      {
        info: () => {},
        warn: () => {},
        error: () => {},
      } as any
    );

    const event = new OrderPaidEvent(
      OrderId.random(),
      CustomerId.create("user_123").getValue(),
      Money.create(10, "USD").getValue()
    );

    await subscriber.on(event);

    expect(calledWith).not.toBeNull();
    expect(calledWith!).toEqual({ userId: "user_123", anonymousId: null });
  });
});
