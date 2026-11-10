import { ListOrders } from "./ListOrders";
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { SalesQueryService } from "../queries/SalesQueryService";
import { OrderDTO } from "../OrderDTO";

class MockSalesQueryService implements SalesQueryService {
  getOrderById = mock(async (orderId: string) =>
    Result.ok<OrderDTO | null, DomainError>(null)
  );
  listOrdersByCustomer = mock(async (customerId: string) =>
    Result.ok<OrderDTO[], DomainError>([])
  );
}

describe("ListOrders Use Case", () => {
  let listOrders: ListOrders;
  let salesQueryService: MockSalesQueryService;

  beforeEach(() => {
    salesQueryService = new MockSalesQueryService();
    listOrders = new ListOrders(salesQueryService);
  });

  const userId = crypto.randomUUID();

  it("should return empty list if no orders found", async () => {
    salesQueryService.listOrdersByCustomer.mockResolvedValue(
      Result.ok<OrderDTO[], DomainError>([])
    );
    const result = await listOrders.execute({ userId });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual([]);
  });

  it("should return mapped orders DTOs", async () => {
    const order: OrderDTO = {
      id: crypto.randomUUID(),
      customerId: userId,
      items: [
        {
          stickerId: crypto.randomUUID(),
          stickerName: "Sticker 1",
          stickerImageUrl: "http://img/1",
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
          currency: "EUR",
        },
      ],
      totalAmount: 200,
      currency: "EUR",
      status: "PAID",
      paymentIntentId: "pi_123",
      createdAt: new Date().toISOString(),
    };

    salesQueryService.listOrdersByCustomer.mockResolvedValue(
      Result.ok<OrderDTO[], DomainError>([order])
    );

    const result = await listOrders.execute({ userId });

    expect(result.isSuccess).toBe(true);
    const dtos = result.getValue();
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe(order.id);
    expect(dtos[0].totalAmount).toBe(200);
    expect(dtos[0].items).toHaveLength(1);
  });
});
