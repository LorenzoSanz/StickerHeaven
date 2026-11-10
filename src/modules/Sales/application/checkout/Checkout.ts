/**
 * POR QUÉ: Caso de uso para gestionar el proceso de checkout convirtiendo items del carrito en un pedido.
 * INTEGRIDAD: Garantiza que el pedido se cree a partir del estado autoritativo del carrito.
 * ESTRUCTURA: Capa Application - Caso de uso.
 *
 * FLUJO:
 * 1) Obtener snapshot del carrito (CartGateway).
 * 2) Validar que haya items y usuario autenticado.
 * 3) Delegar en CreateOrder (calcula total en backend, prepara pago, reduce stock con compensación).
 */
import { CartGateway, CartItemDTO } from "../../domain/gateways/CartGateway";
import { CreateOrder } from "../create-order/CreateOrder";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { CartEmptyError } from "../../domain/Errors";

type CheckoutValue = { id: string; clientSecret: string };
type CheckoutResult = Result<CheckoutValue, DomainError>;

function stableCheckoutKey(cartId: string, items: CartItemDTO[]): string {
  // POR QUÉ: El checkout es sensible a doble click/reintentos; generamos una clave estable basada en el “snapshot” del carrito.
  const normalized = items
    .map((i) => ({ stickerId: i.stickerId, quantity: i.quantity }))
    .sort((a, b) => a.stickerId.localeCompare(b.stickerId));
  return `${cartId}:${JSON.stringify(normalized)}`;
}

/**
 * POR QUÉ: Evitamos crear múltiples PaymentIntents/pedidos si el usuario dispara checkout repetidamente con el mismo carrito.
 * QUÉ: Deduplica por un TTL corto y comparte promesas “in-flight” por clave de snapshot.
 */
export class Checkout {
  private readonly cacheTtlMs = 30_000;
  private readonly maxCachedEntries = 200;
  private readonly recentByKey = new Map<string, { expiresAt: number; result: CheckoutResult }>();
  private readonly inFlightByKey = new Map<string, Promise<CheckoutResult>>();

  constructor(
    private cartGateway: CartGateway,
    private createOrder: CreateOrder
  ) {}

  /**
   * Orquesta el flujo de checkout: obtener carrito, crear pedido e iniciar el pago.
   * 
   * @param userId - usuario autenticado ID.
   * @param anonymousId - sesión de invitado ID.
   * @returns Resultado que contiene el ID del pedido y client secret de Stripe.
   * @throws DomainError if cart is empty or user is not logged in.
   */
  async execute(userId: string | null, anonymousId: string | null): Promise<CheckoutResult> {
    const cartResult = await this.cartGateway.getCartSnapshot(userId, anonymousId);
    if (cartResult.isFailure) return Result.fail(cartResult.error!);

    const { id: cartId, items } = cartResult.getValue();
    const now = Date.now();
    const key = stableCheckoutKey(cartId, items);

    const cached = this.recentByKey.get(key);
    if (cached && cached.expiresAt > now) return cached.result;

    const inFlight = this.inFlightByKey.get(key);
    if (inFlight) return await inFlight;

    if (items.length === 0) {
      return Result.fail(new CartEmptyError());
    }

    if (!userId) {
      return Result.fail(
        new DomainError("User must be logged in to checkout (Guest checkout not fully implemented)")
      );
    }

    const promise = this.createOrder.execute({ userId, items });
    this.inFlightByKey.set(key, promise);

    try {
      const result = await promise;
      if (result.isSuccess) {
        if (this.recentByKey.size >= this.maxCachedEntries) {
          for (const [k, v] of this.recentByKey) {
            if (v.expiresAt <= now) this.recentByKey.delete(k);
            if (this.recentByKey.size < this.maxCachedEntries) break;
          }
        }
        this.recentByKey.set(key, { expiresAt: now + this.cacheTtlMs, result });
      }
      return result;
    } finally {
      this.inFlightByKey.delete(key);
    }
  }
}
