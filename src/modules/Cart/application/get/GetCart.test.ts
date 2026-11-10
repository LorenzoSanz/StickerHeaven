/**
 * POR QUÉ: Pruebas para GetCart Caso de uso.
 * INTEGRIDAD: Verifica correctness of retrieving cart.
 * ESTRUCTURA: Suite de tests.
 */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { GetCart } from "./GetCart";
import { CartQueryService } from "../queries/CartQueryService";
import { CartDTO } from "./CartDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";

class MockCartQueryService implements CartQueryService {
  getCart = mock(async (userId: string | null, anonymousId: string | null) =>
    Result.ok<CartDTO, DomainError>({
      items: [],
      totalAmount: 0,
      currency: "USD",
    })
  );
}

describe("GetCart Use Case", () => {
  let getCart: GetCart;
  let mockQueryService: MockCartQueryService;

  beforeEach(() => {
    mockQueryService = new MockCartQueryService();
    getCart = new GetCart(mockQueryService);
  });

  it("should return empty cart DTO if cart not found", async () => {
    mockQueryService.getCart.mockResolvedValue(
      Result.ok<CartDTO, DomainError>({
        items: [],
        totalAmount: 0,
        currency: "USD",
      })
    );
    
    const result = await getCart.execute(crypto.randomUUID(), null);
    
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      items: [],
      totalAmount: 0,
      currency: "USD",
    });
  });

  it("should return enriched cart DTO if found", async () => {
    const cartId = crypto.randomUUID();
    const dto: CartDTO = {
        id: cartId,
        items: [{
            stickerId: crypto.randomUUID(),
            quantity: 2,
            price: 50,
            total: 100,
            currency: "USD"
        }],
        totalAmount: 100,
        currency: "USD"
    };

    mockQueryService.getCart.mockResolvedValue(Result.ok<CartDTO, DomainError>(dto));

    const result = await getCart.execute(crypto.randomUUID(), null);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(dto);
  });
});
