import { createLazySingleton } from "../utils";
import type { ILogger } from "@/shared/domain/ILogger";
import type { CatalogReadPort } from "@/shared/contracts/CatalogPorts";
import { CartCatalogAdapter } from "@/infrastructure/adapters/cart/CartCatalogAdapter";
import { MongoCartRepository } from "@/modules/Cart/infrastructure/persistence/mongoose/MongoCartRepository";
import { MongoCartQueryService } from "@/modules/Cart/infrastructure/queries/MongoCartQueryService";
import { AddItemToCart } from "@/modules/Cart/application/add-item/AddItemToCart";
import { UpdateCartItemQuantity } from "@/modules/Cart/application/update-item/UpdateCartItemQuantity";
import { RemoveItemFromCart } from "@/modules/Cart/application/remove-item/RemoveItemFromCart";
import { GetCart } from "@/modules/Cart/application/get/GetCart";
import { MergeCarts } from "@/modules/Cart/application/merge/MergeCarts";
import { ClearCart } from "@/modules/Cart/application/clear-cart/ClearCart";
import type { CartReadPort, CartWritePort } from "@/shared/contracts/CartPorts";
import { Result } from "@/shared/domain/Result";

export function createCartModule(deps: { catalogReadPort: () => CatalogReadPort; logger: () => ILogger }) {
  const getCartCatalogAdapter = createLazySingleton(() => new CartCatalogAdapter(deps.catalogReadPort()));
  const getCartRepository = createLazySingleton(() => new MongoCartRepository());
  const getCartQueryService = createLazySingleton(() => new MongoCartQueryService(getCartCatalogAdapter()));
  
  // Es responsable de coordinar la lógica de negocio relacionada con el carrito.
  const useCases = {
    addItemToCart: createLazySingleton(() => new AddItemToCart(getCartRepository(), getCartCatalogAdapter())),
    updateCartItemQuantity: createLazySingleton(() => new UpdateCartItemQuantity(getCartRepository())),
    removeItemFromCart: createLazySingleton(() => new RemoveItemFromCart(getCartRepository())),
    getCart: createLazySingleton(() => new GetCart(getCartQueryService())),
    mergeCarts: createLazySingleton(() => new MergeCarts(getCartRepository())),
    clearCart: createLazySingleton(() => new ClearCart(getCartRepository())),
  };

  const queries = {
    cartQueryService: getCartQueryService,
  };
  const repositories = {
    cart: getCartRepository,
  };

  const cartReadPort = createLazySingleton<CartReadPort>(() => ({
    getCartSnapshot: async (userId: string | null, anonymousId: string | null) => {
      const result = await useCases.getCart().execute(userId, anonymousId);
      if (result.isFailure) return Result.fail(result.error!);
      const cart = result.getValue();
      const stableId = cart.id ?? cart.anonymousCartId ?? userId ?? anonymousId ?? "cart:empty";
      return Result.ok({
        id: stableId,
        items: cart.items.map((i) => ({ stickerId: i.stickerId, quantity: i.quantity })),
      });
    },
  }));

  const cartWritePort = createLazySingleton<CartWritePort>(() => ({
    clearCart: async (userId: string | null, anonymousId: string | null) => {
      return await useCases.clearCart().execute(userId, anonymousId);
    },
  }));
  
  const ports = {
    read: cartReadPort,
    write: cartWritePort,
  };
  
  // Este return es el punto de entrada para interactuar con el módulo Cart.
  return {
    useCases,
    queries,
    repositories,
    ports,
  };
}
