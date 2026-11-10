import { describe, it, expect, mock, beforeEach } from "bun:test";
import { AddItemToCart } from "./AddItemToCart";
import { CartRepository } from "../../domain/CartRepository";
import { CatalogGateway, ProductInfo } from "../CatalogGateway";
import { Cart } from "../../domain/Cart";
import { OwnerId } from "../../domain/OwnerId";
import { CartId } from "../../domain/CartId";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { AnonymousCartId } from "../../domain/AnonymousCartId";

class MockCartRepository implements CartRepository {
  save = mock(async (cart: Cart) => Result.ok<void, DomainError>());
  findById = mock(async (id: CartId) => Result.ok<Cart | null, DomainError>(null));
  findByUserId = mock(async (id: OwnerId) => Result.ok<Cart | null, DomainError>(null));
  findByGuestId = mock(async (id: AnonymousCartId) => Result.ok<Cart | null, DomainError>(null));
  delete = mock(async (id: CartId) => Result.ok<void, DomainError>());
}

import { StickerId } from "../../domain/StickerId";

class MockCatalogGateway implements CatalogGateway {
  getProductsInfo = mock(async (ids: StickerId[]) => Result.ok<ProductInfo[], DomainError>([]));
  getProductInfo = mock(async (id: StickerId) => Result.fail<ProductInfo, DomainError>(new DomainError("Not implemented")));
}

describe("AddItemToCart Use Case", () => {
  let addItemToCart: AddItemToCart;
  let mockCartRepo: MockCartRepository;
  let mockCatalogGateway: MockCatalogGateway;

  beforeEach(() => {
    mockCartRepo = new MockCartRepository();
    mockCatalogGateway = new MockCatalogGateway();
    addItemToCart = new AddItemToCart(mockCartRepo, mockCatalogGateway);
  });

  const productInfo: ProductInfo = {
    id: crypto.randomUUID(),
    priceAmount: 100,
    priceCurrency: "EUR",
    stock: 10
  };

  it("should create a new cart and add item if cart does not exist", async () => {
    // Setup
    mockCatalogGateway.getProductInfo.mockResolvedValue(
      Result.ok<ProductInfo, DomainError>(productInfo)
    );
    
    // Execute
    const result = await addItemToCart.execute({
        userId: crypto.randomUUID(),
        anonymousId: null,
        stickerId: productInfo.id,
        quantity: 1
    });

    expect(result.isSuccess).toBe(true);
    expect(mockCartRepo.save).toHaveBeenCalled();
  });

  it("should add item to existing cart", async () => {
    // Setup
    mockCatalogGateway.getProductInfo.mockResolvedValue(
      Result.ok<ProductInfo, DomainError>(productInfo)
    );
    
    const userId = crypto.randomUUID();
    const existingCart = Cart.create(CartId.create(crypto.randomUUID()).getValue(), OwnerId.create(userId).getValue());
    mockCartRepo.findByUserId.mockResolvedValue(
      Result.ok<Cart | null, DomainError>(existingCart)
    );

    // Execute
    const result = await addItemToCart.execute({
        userId: userId,
        anonymousId: null,
        stickerId: productInfo.id,
        quantity: 2
    });

    expect(result.isSuccess).toBe(true);
    expect(mockCartRepo.save).toHaveBeenCalled();
    expect(existingCart.items.length).toBe(1);
    expect(existingCart.items[0].quantity.value).toBe(2);
  });

  it("should fail if product stock is insufficient", async () => {
     mockCatalogGateway.getProductInfo.mockResolvedValue(
      Result.ok<ProductInfo, DomainError>({
        ...productInfo,
        stock: 0
      })
     );

     const result = await addItemToCart.execute({
         userId: crypto.randomUUID(),
         anonymousId: null,
         stickerId: productInfo.id,
         quantity: 1
     });
     
     expect(result.isFailure).toBe(true);
     expect(result.error?.message).toContain("Insufficient stock");
     expect(mockCartRepo.save).not.toHaveBeenCalled();
  });
});
