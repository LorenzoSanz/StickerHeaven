import { beforeEach, describe, expect, it, mock } from "bun:test";
import { CancelOrder } from "./CancelOrder";
import { OrderRepository } from "@/modules/Sales/domain/OrderRepository";
import { PaymentGateway } from "@/modules/Sales/domain/gateways/PaymentGateway";
import { CatalogGateway } from "../gateways/CatalogGateway";
import { Order } from "@/modules/Sales/domain/Order";
import { OrderId } from "@/modules/Sales/domain/OrderId";
import { OrderItem } from "@/modules/Sales/domain/OrderItem";
import { OrderStatus } from "@/modules/Sales/domain/OrderStatus";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { PaymentIntentId } from "@/modules/Sales/domain/PaymentIntentId";
import { UnauthorizedOrderAccessError } from "@/modules/Sales/domain/Errors";
import { StickerId } from "@/shared/domain/StickerId";
import { Money } from "@/shared/domain/Money";
import { Quantity } from "@/shared/domain/Quantity";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

const OWNER = crypto.randomUUID();

function pendingOrder(): Order {
  const item = OrderItem.create(
    StickerId.create(crypto.randomUUID()).getValue(),
    "Sticker",
    "https://example.com/s.png",
    Quantity.create(2).getValue(),
    Money.create(5, "EUR").getValue()
  ).getValue();
  return Order.reconstitute(
    {
      customerId: CustomerId.create(OWNER).getValue(),
      items: [item],
      totalAmount: Money.create(10, "EUR").getValue(),
      status: OrderStatus.create("PENDING_PAYMENT").getValue(),
      paymentIntentId: PaymentIntentId.create("pi_1").getValue(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
    OrderId.create(crypto.randomUUID()).getValue()
  );
}

describe("CancelOrder", () => {
  let order: Order;
  let repository: { findById: ReturnType<typeof mock>; save: ReturnType<typeof mock> };
  let payments: { cancelPaymentIntent: ReturnType<typeof mock>; refundPayment: ReturnType<typeof mock> };
  let catalog: { restoreStock: ReturnType<typeof mock> };
  let useCase: CancelOrder;

  beforeEach(() => {
    order = pendingOrder();
    repository = {
      findById: mock(async () => Result.ok<Order | null, DomainError>(order)),
      save: mock(async () => Result.ok<void, DomainError>()),
    };
    payments = {
      cancelPaymentIntent: mock(async () => Result.ok<void, DomainError>()),
      refundPayment: mock(async () => Result.ok<void, DomainError>()),
    };
    catalog = { restoreStock: mock(async () => Result.ok<void, DomainError>()) };
    const logger = { info: mock(() => {}), warn: mock(() => {}), error: mock(() => {}), debug: mock(() => {}) };
    useCase = new CancelOrder(
      repository as unknown as OrderRepository,
      payments as unknown as PaymentGateway,
      catalog as unknown as CatalogGateway,
      logger
    );
  });

  it("refuses to cancel another customer's order and touches nothing", async () => {
    const result = await useCase.execute({ orderId: order.id.value, userId: crypto.randomUUID() });

    expect(result.error).toBeInstanceOf(UnauthorizedOrderAccessError);
    expect(payments.cancelPaymentIntent).not.toHaveBeenCalled();
    expect(catalog.restoreStock).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("cancels the owner's pending order, its PaymentIntent and gives the stock back", async () => {
    const result = await useCase.execute({ orderId: order.id.value, userId: OWNER });

    expect(result.isSuccess).toBe(true);
    expect(order.isCancelled()).toBe(true);
    expect(payments.cancelPaymentIntent).toHaveBeenCalledWith("pi_1");
    expect(catalog.restoreStock.mock.calls[0][1]).toBe(2);
  });
});
