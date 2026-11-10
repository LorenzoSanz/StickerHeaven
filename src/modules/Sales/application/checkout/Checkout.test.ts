import { describe, expect, it, mock } from "bun:test";
import { Checkout } from "./Checkout";
import type { CartGateway, CartItemDTO, CartSnapshotDTO } from "@/modules/Sales/domain/gateways/CartGateway";
import type { CreateOrder } from "../create-order/CreateOrder";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

describe("Checkout Use Case", () => {
  it("dedupes repeated checkout calls by cart snapshot", async () => {
    const clearCart = mock(async () => Result.ok<void, DomainError>());
    const getCartSnapshot = mock(
      async (_userId: string | null, _anonymousId: string | null) =>
        Result.fail<CartSnapshotDTO, DomainError>(new DomainError("not configured"))
    );
    const cartGateway: CartGateway = { clearCart, getCartSnapshot };

    const execute = mock(async () => Result.ok({ id: "order-1", clientSecret: "cs-1" }));
    const createOrder = { execute } as unknown as CreateOrder;

    getCartSnapshot.mockResolvedValueOnce(
      Result.ok({
        id: "cart-1",
        items: [{ stickerId: "sticker-1", quantity: 1 } satisfies CartItemDTO],
      })
    );

    getCartSnapshot.mockResolvedValueOnce(
      Result.ok({
        id: "cart-1",
        items: [{ stickerId: "sticker-1", quantity: 1 } satisfies CartItemDTO],
      })
    );

    const useCase = new Checkout(cartGateway, createOrder);

    const first = await useCase.execute("user-1", null);
    const second = await useCase.execute("user-1", null);

    expect(first.isSuccess).toBe(true);
    expect(second.isSuccess).toBe(true);
    expect(first.getValue()).toEqual({ id: "order-1", clientSecret: "cs-1" });
    expect(second.getValue()).toEqual({ id: "order-1", clientSecret: "cs-1" });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("does not reuse cached checkout when cart items change", async () => {
    const clearCart = mock(async () => Result.ok<void, DomainError>());
    const getCartSnapshot = mock(
      async (_userId: string | null, _anonymousId: string | null) =>
        Result.fail<CartSnapshotDTO, DomainError>(new DomainError("not configured"))
    );
    const cartGateway: CartGateway = { clearCart, getCartSnapshot };

    const execute = mock(async () => Result.ok({ id: "order-1", clientSecret: "cs-1" }));
    execute
      .mockResolvedValueOnce(Result.ok({ id: "order-1", clientSecret: "cs-1" }))
      .mockResolvedValueOnce(Result.ok({ id: "order-2", clientSecret: "cs-2" }));
    const createOrder = { execute } as unknown as CreateOrder;

    getCartSnapshot
      .mockResolvedValueOnce(
        Result.ok({
          id: "cart-1",
          items: [
            { stickerId: "sticker-1", quantity: 1 } satisfies CartItemDTO,
            { stickerId: "sticker-2", quantity: 1 } satisfies CartItemDTO,
          ],
        })
      )
      .mockResolvedValueOnce(
        Result.ok({
          id: "cart-1",
          items: [
            { stickerId: "sticker-1", quantity: 2 } satisfies CartItemDTO,
            { stickerId: "sticker-2", quantity: 1 } satisfies CartItemDTO,
          ],
        })
      );

    const useCase = new Checkout(cartGateway, createOrder);

    const first = await useCase.execute("user-1", null);
    const second = await useCase.execute("user-1", null);

    expect(first.isSuccess).toBe(true);
    expect(second.isSuccess).toBe(true);
    expect(first.getValue()).toEqual({ id: "order-1", clientSecret: "cs-1" });
    expect(second.getValue()).toEqual({ id: "order-2", clientSecret: "cs-2" });
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
