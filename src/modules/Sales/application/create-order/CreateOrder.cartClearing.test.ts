import { describe, it, expect } from "bun:test";
import { CreateOrder } from "./CreateOrder";
import { Result } from "@/shared/domain/Result";
import { Money } from "@/shared/domain/Money";

describe("CreateOrder (cart clearing)", () => {
  it("should not clear cart during order creation", async () => {
    let clearCartCalled = false;

    const useCase = new CreateOrder(
      { save: async () => Result.ok(), findById: async () => Result.ok(null), findByCustomerId: async () => Result.ok([]), findByPaymentIntentId: async () => Result.ok(null), delete: async () => Result.ok() } as any,
      {
        getProductsInfo: async () =>
          Result.ok([
            { id: "sticker_1", name: "S", imageUrl: "x", price: 10, currency: "USD", stock: 10 },
          ]),
        reduceStock: async () => Result.ok(),
        restoreStock: async () => Result.ok(),
      } as any,
      {
        createPaymentIntent: async () => Result.ok({ id: "pi_123", clientSecret: "cs_123" }),
        cancelPaymentIntent: async () => Result.ok(),
        refundPayment: async () => Result.ok(),
      } as any,
      {
        clearCart: async () => {
          clearCartCalled = true;
          return Result.ok();
        },
        getCartSnapshot: async () => Result.fail(new Error("not used") as any),
      } as any,
      { info: () => {}, warn: () => {}, error: () => {} } as any
    );

    const res = await useCase.execute({
      userId: "user_123",
      items: [{ stickerId: "sticker_1", quantity: 1 }],
    });

    expect(res.isSuccess).toBe(true);
    expect(clearCartCalled).toBe(false);
  });
});
