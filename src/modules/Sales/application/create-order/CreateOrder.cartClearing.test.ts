import { describe, it, expect } from "bun:test";
import { CreateOrder } from "./CreateOrder";
import { Result } from "@/shared/domain/Result";
import { Money } from "@/shared/domain/Money";

const STICKER_ID = "5b2f8c1e-9d4a-4e6b-8f3a-2c7d1e9b0a64";

describe("CreateOrder (cart clearing)", () => {
  it("should not clear cart during order creation", async () => {
    let clearCartCalled = false;

    const useCase = new CreateOrder(
      { save: async () => Result.ok(), findById: async () => Result.ok(null), findByCustomerId: async () => Result.ok([]), findByPaymentIntentId: async () => Result.ok(null), delete: async () => Result.ok() } as any,
      {
        getProductsInfo: async () =>
          Result.ok([
            { id: STICKER_ID, name: "S", imageUrl: "x", price: 10, currency: "USD", stock: 10 },
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
      items: [{ stickerId: STICKER_ID, quantity: 1 }],
    });

    expect(res.isSuccess).toBe(true);
    expect(clearCartCalled).toBe(false);
  });
});
