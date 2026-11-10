import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Checkout } from "./Checkout";
import type { CartGateway, CartItemDTO, CartSnapshotDTO } from "@/modules/Sales/domain/gateways/CartGateway";
import type { CreateOrder } from "../create-order/CreateOrder";
import type { OrderRepository } from "@/modules/Sales/domain/OrderRepository";
import { Order } from "@/modules/Sales/domain/Order";
import { OrderId } from "@/modules/Sales/domain/OrderId";
import { OrderItem } from "@/modules/Sales/domain/OrderItem";
import { OrderStatus } from "@/modules/Sales/domain/OrderStatus";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { PaymentIntentId } from "@/modules/Sales/domain/PaymentIntentId";
import { StickerId } from "@/shared/domain/StickerId";
import { Money } from "@/shared/domain/Money";
import { Quantity } from "@/shared/domain/Quantity";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

const USER = crypto.randomUUID();
const STICKER_A = crypto.randomUUID();
const STICKER_B = crypto.randomUUID();

function pendingOrder(items: CartItemDTO[]): Order {
  return Order.reconstitute(
    {
      customerId: CustomerId.create(USER).getValue(),
      items: items.map((i) =>
        OrderItem.create(
          StickerId.create(i.stickerId).getValue(),
          "Sticker",
          "https://example.com/s.png",
          Quantity.create(i.quantity).getValue(),
          Money.create(5, "EUR").getValue()
        ).getValue()
      ),
      totalAmount: Money.create(5, "EUR").getValue(),
      status: OrderStatus.create("PENDING_PAYMENT").getValue(),
      paymentIntentId: PaymentIntentId.create("pi_existing").getValue(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
    OrderId.create(crypto.randomUUID()).getValue()
  );
}

describe("Checkout", () => {
  let cart: CartItemDTO[];
  let pendingOrders: Order[];
  let createOrder: { execute: ReturnType<typeof mock> };
  let repository: { findPendingPaymentForCustomer: ReturnType<typeof mock> };
  let payments: { getClientSecret: ReturnType<typeof mock> };
  let useCase: Checkout;

  beforeEach(() => {
    cart = [{ stickerId: STICKER_A, quantity: 1 }];
    pendingOrders = [];
    const cartGateway: CartGateway = {
      clearCart: mock(async () => Result.ok<void, DomainError>()),
      getCartSnapshot: mock(async () => Result.ok<CartSnapshotDTO, DomainError>({ id: "cart-1", items: cart })),
    };
    createOrder = { execute: mock(async () => Result.ok({ id: "new-order", clientSecret: "cs-new" })) };
    repository = {
      findPendingPaymentForCustomer: mock(async () => Result.ok<Order[], DomainError>(pendingOrders)),
    };
    payments = { getClientSecret: mock(async () => Result.ok<string, DomainError>("cs-existing")) };
    useCase = new Checkout(
      cartGateway,
      createOrder as unknown as CreateOrder,
      repository as unknown as OrderRepository,
      payments
    );
  });

  it("reuses the customer's pending order for the same cart instead of creating another", async () => {
    const existing = pendingOrder(cart);
    pendingOrders = [existing];

    const result = await useCase.execute(USER, null);

    expect(result.getValue()).toEqual({ id: existing.id.value, clientSecret: "cs-existing" });
    expect(payments.getClientSecret).toHaveBeenCalledWith("pi_existing");
    expect(createOrder.execute).not.toHaveBeenCalled();
  });

  it("creates a new order when the cart changed since the pending one", async () => {
    pendingOrders = [pendingOrder([{ stickerId: STICKER_A, quantity: 1 }])];
    cart = [
      { stickerId: STICKER_A, quantity: 2 },
      { stickerId: STICKER_B, quantity: 1 },
    ];

    const result = await useCase.execute(USER, null);

    expect(result.getValue()).toEqual({ id: "new-order", clientSecret: "cs-new" });
    expect(createOrder.execute).toHaveBeenCalledTimes(1);
  });

  it("joins simultaneous checkouts of the same cart into one order", async () => {
    const [first, second] = await Promise.all([useCase.execute(USER, null), useCase.execute(USER, null)]);

    expect(first.getValue()).toEqual(second.getValue());
    expect(createOrder.execute).toHaveBeenCalledTimes(1);
  });

  it("still creates the order when the reuse lookup fails", async () => {
    repository.findPendingPaymentForCustomer.mockResolvedValue(Result.fail(new DomainError("db down")));

    const result = await useCase.execute(USER, null);

    expect(result.isSuccess).toBe(true);
    expect(createOrder.execute).toHaveBeenCalledTimes(1);
  });

  it("rejects an empty cart", async () => {
    cart = [];

    const result = await useCase.execute(USER, null);

    expect(result.isFailure).toBe(true);
    expect(createOrder.execute).not.toHaveBeenCalled();
  });
});
