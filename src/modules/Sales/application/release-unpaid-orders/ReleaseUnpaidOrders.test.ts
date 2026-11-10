import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ReleaseUnpaidOrders } from "./ReleaseUnpaidOrders";
import { OrderRepository } from "../../domain/OrderRepository";
import { PaymentGateway } from "../../domain/gateways/PaymentGateway";
import { CatalogGateway } from "../gateways/CatalogGateway";
import { Order } from "../../domain/Order";
import { OrderId } from "../../domain/OrderId";
import { OrderItem } from "../../domain/OrderItem";
import { OrderStatus } from "../../domain/OrderStatus";
import { CustomerId } from "../../domain/CustomerId";
import { PaymentIntentId } from "../../domain/PaymentIntentId";
import { StickerId } from "@/shared/domain/StickerId";
import { Money } from "@/shared/domain/Money";
import { Quantity } from "@/shared/domain/Quantity";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

const NOW = new Date("2026-11-10T12:00:00Z");
const THIRTY_MINUTES = 30 * 60 * 1000;

function pendingOrder(status: "PENDING_PAYMENT" | "PAID" | "CANCELLED" = "PENDING_PAYMENT"): Order {
  const item = OrderItem.create(
    StickerId.create(crypto.randomUUID()).getValue(),
    "Sticker",
    "https://example.com/s.png",
    Quantity.create(3).getValue(),
    Money.create(5, "EUR").getValue()
  ).getValue();
  return Order.reconstitute(
    {
      customerId: CustomerId.create(crypto.randomUUID()).getValue(),
      items: [item],
      totalAmount: Money.create(15, "EUR").getValue(),
      status: OrderStatus.create(status).getValue(),
      paymentIntentId: PaymentIntentId.create("pi_123").getValue(),
      createdAt: new Date(NOW.getTime() - 2 * THIRTY_MINUTES),
      updatedAt: new Date(NOW.getTime() - 2 * THIRTY_MINUTES),
      version: 1,
    },
    OrderId.create(crypto.randomUUID()).getValue()
  );
}

describe("ReleaseUnpaidOrders", () => {
  let repository: {
    findPendingPaymentCreatedBefore: ReturnType<typeof mock>;
    findByPaymentIntentId: ReturnType<typeof mock>;
    save: ReturnType<typeof mock>;
  };
  let payments: { cancelPaymentIntent: ReturnType<typeof mock> };
  let catalog: { restoreStock: ReturnType<typeof mock> };
  let useCase: ReleaseUnpaidOrders;

  beforeEach(() => {
    repository = {
      findPendingPaymentCreatedBefore: mock(async () => Result.ok<Order[], DomainError>([])),
      findByPaymentIntentId: mock(async () => Result.ok<Order | null, DomainError>(null)),
      save: mock(async () => Result.ok<void, DomainError>()),
    };
    payments = { cancelPaymentIntent: mock(async () => Result.ok<void, DomainError>()) };
    catalog = { restoreStock: mock(async () => Result.ok<void, DomainError>()) };
    const logger = { info: mock(() => {}), warn: mock(() => {}), error: mock(() => {}), debug: mock(() => {}) };
    useCase = new ReleaseUnpaidOrders(
      repository as unknown as OrderRepository,
      payments as unknown as PaymentGateway,
      catalog as unknown as CatalogGateway,
      logger,
      () => NOW
    );
  });

  it("cancels old unpaid orders and gives their stock back", async () => {
    const order = pendingOrder();
    repository.findPendingPaymentCreatedBefore.mockResolvedValue(Result.ok([order]));

    const result = await useCase.execute(THIRTY_MINUTES);

    expect(result.getValue()).toEqual({ released: 1, skipped: 0 });
    expect(repository.findPendingPaymentCreatedBefore.mock.calls[0][0]).toEqual(new Date(NOW.getTime() - THIRTY_MINUTES));
    expect(payments.cancelPaymentIntent).toHaveBeenCalledWith("pi_123");
    expect(order.isCancelled()).toBe(true);
    expect(catalog.restoreStock).toHaveBeenCalledTimes(1);
    expect(catalog.restoreStock.mock.calls[0][1]).toBe(3);
  });

  it("leaves the order alone when Stripe refuses the cancel (already paid)", async () => {
    const order = pendingOrder();
    repository.findPendingPaymentCreatedBefore.mockResolvedValue(Result.ok([order]));
    payments.cancelPaymentIntent.mockResolvedValue(Result.fail(new DomainError("already succeeded")));

    const result = await useCase.execute(THIRTY_MINUTES);

    expect(result.getValue()).toEqual({ released: 0, skipped: 1 });
    expect(order.isCancelled()).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
    expect(catalog.restoreStock).not.toHaveBeenCalled();
  });

  it("does not restore stock when another process changed the order first", async () => {
    repository.findPendingPaymentCreatedBefore.mockResolvedValue(Result.ok([pendingOrder()]));
    repository.save.mockResolvedValue(Result.fail(new DomainError("Concurrency Error")));

    const result = await useCase.execute(THIRTY_MINUTES);

    expect(result.getValue()).toEqual({ released: 0, skipped: 1 });
    expect(catalog.restoreStock).not.toHaveBeenCalled();
  });

  it("releases an order when Stripe reports its PaymentIntent as canceled", async () => {
    const order = pendingOrder();
    repository.findByPaymentIntentId.mockResolvedValue(Result.ok<Order | null, DomainError>(order));

    const result = await useCase.releaseByPaymentIntent("pi_123");

    expect(result.getValue()).toBe(true);
    expect(payments.cancelPaymentIntent).not.toHaveBeenCalled();
    expect(catalog.restoreStock).toHaveBeenCalledTimes(1);
  });

  it("ignores canceled intents of orders that are already paid", async () => {
    repository.findByPaymentIntentId.mockResolvedValue(Result.ok<Order | null, DomainError>(pendingOrder("PAID")));

    const result = await useCase.releaseByPaymentIntent("pi_123");

    expect(result.getValue()).toBe(false);
    expect(catalog.restoreStock).not.toHaveBeenCalled();
  });
});
