import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ConfirmPayment } from "./ConfirmPayment";
import { OrderRepository } from "../../domain/OrderRepository";
import { Order } from "../../domain/Order";
import { OrderId } from "../../domain/OrderId";
import { CustomerId } from "../../domain/CustomerId";
import { PaymentIntentId } from "../../domain/PaymentIntentId";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { OrderStatus } from "../../domain/OrderStatus";
import { Money } from "../../../../shared/domain/Money";

class MockOrderRepository implements OrderRepository {
  save = mock(async (order: Order) => Result.ok<void, DomainError>());
  findById = mock(async (id: OrderId) => Result.ok<Order | null, DomainError>(null));
  findByCustomerId = mock(async (id: CustomerId) => Result.ok<Order[], DomainError>([]));
  findByPaymentIntentId = mock(async (id: PaymentIntentId) => Result.ok<Order | null, DomainError>(null));
  findPendingPaymentCreatedBefore = mock(async (cutoff: Date, limit: number) => Result.ok<Order[], DomainError>([]));
  delete = mock(async (id: OrderId) => Result.ok<void, DomainError>());
}

class MockLogger {
  info = mock(() => {});
  error = mock(() => {});
  warn = mock(() => {});
  debug = mock(() => {});
}

describe("ConfirmPayment Use Case", () => {
  let confirmPayment: ConfirmPayment;
  let mockOrderRepo: MockOrderRepository;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockOrderRepo = new MockOrderRepository();
    mockLogger = new MockLogger();
    confirmPayment = new ConfirmPayment(mockOrderRepo, mockLogger);
  });

  const createOrder = (status: "PENDING_PAYMENT" | "PAID" | "CANCELLED" = "PENDING_PAYMENT") => {
    return Order.reconstitute({
        customerId: CustomerId.create(crypto.randomUUID()).getValue(),
        items: [],
        totalAmount: Money.create(10, "USD").getValue(),
        status: OrderStatus.create(status).getValue(),
        paymentIntentId: PaymentIntentId.create("pi_123").getValue(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0
    }, OrderId.create(crypto.randomUUID()).getValue());
  };

  it("should confirm payment successfully", async () => {
    const order = createOrder("PENDING_PAYMENT");
    mockOrderRepo.findByPaymentIntentId.mockResolvedValue(
      Result.ok<Order | null, DomainError>(order)
    );

    const result = await confirmPayment.execute({ paymentIntentId: "pi_123" });

    expect(result.isSuccess).toBe(true);
    expect(order.status.value).toBe("PAID");
    expect(mockOrderRepo.save).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("confirmed as PAID"));
  });

  it("should be idempotent (handle already paid orders)", async () => {
    const order = createOrder("PAID");
    mockOrderRepo.findByPaymentIntentId.mockResolvedValue(
      Result.ok<Order | null, DomainError>(order)
    );

    const result = await confirmPayment.execute({ paymentIntentId: "pi_123" });

    expect(result.isSuccess).toBe(true);
    // Should NOT save again
    expect(mockOrderRepo.save).toHaveBeenCalledTimes(0);
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("already paid"));
  });

  it("should fail if order not found", async () => {
    mockOrderRepo.findByPaymentIntentId.mockResolvedValue(
      Result.ok<Order | null, DomainError>(null)
    );

    const result = await confirmPayment.execute({ paymentIntentId: "pi_123" });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain("Order not found");
  });

  it("should fail if payment intent id is invalid", async () => {
    const result = await confirmPayment.execute({ paymentIntentId: "" });

    expect(result.isFailure).toBe(true);
  });
});
