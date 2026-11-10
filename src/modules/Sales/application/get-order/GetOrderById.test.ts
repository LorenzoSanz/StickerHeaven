/**
 * PROPÓSITO: Test suite que valida contratos críticos y previene regresiones.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { GetOrderById } from "./GetOrderById";
import { SalesQueryService } from "../queries/SalesQueryService";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";

class MockSalesQueryService implements SalesQueryService {
  getOrderById = mock(async (orderId: string) =>
    Result.ok<OrderDTO | null, DomainError>(null)
  );

  listOrdersByCustomer = mock(async (customerId: string) =>
    Result.ok<OrderDTO[], DomainError>([])
  );
}

describe("GetOrderById Use Case", () => {
  let getOrderById: GetOrderById;
  let salesQueryService: MockSalesQueryService;

  beforeEach(() => {
    salesQueryService = new MockSalesQueryService();
    getOrderById = new GetOrderById(salesQueryService);
  });

  const makeOrder = (customerId: string): OrderDTO => ({
    id: crypto.randomUUID(),
    customerId,
    items: [],
    totalAmount: 100,
    currency: "EUR",
    status: "PAID",
    paymentIntentId: "pi_123",
    createdAt: new Date().toISOString(),
  });

  it("should return order DTO if found and owned by user", async () => {
    const userId = crypto.randomUUID();
    const order = makeOrder(userId);

    salesQueryService.getOrderById.mockResolvedValue(
      Result.ok<OrderDTO | null, DomainError>(order)
    );

    const result = await getOrderById.execute(order.id, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe(order.id);
  });

  it("should fail if order not found", async () => {
    const userId = crypto.randomUUID();
    const orderId = crypto.randomUUID();

    salesQueryService.getOrderById.mockResolvedValue(
      Result.ok<OrderDTO | null, DomainError>(null)
    );

    const result = await getOrderById.execute(orderId, userId);
    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe("Pedido no encontrado");
  });

  it("should fail if user is unauthorized (owns by another)", async () => {
    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const order = makeOrder(otherUserId);

    salesQueryService.getOrderById.mockResolvedValue(
      Result.ok<OrderDTO | null, DomainError>(order)
    );

    const result = await getOrderById.execute(order.id, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain("no autorizado");
  });
});
