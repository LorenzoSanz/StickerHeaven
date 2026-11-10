/**
 * POR QUÉ: Adaptador del módulo Sales para comunicarse con el módulo Cart.
 * INTEGRIDAD: Implementa los métodos de CartGateway para interactuar con el módulo Cart.
 * ESTRUCTURA: Capa de infraestructura (Sales Adapter).
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 */
import { CartGateway, CartItemDTO, CartSnapshotDTO } from "@/modules/Sales/domain/gateways/CartGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import type { CartReadPort, CartWritePort } from "@/shared/contracts/CartPorts";
import { ConcurrencyError } from "@/shared/domain/ConcurrencyError";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class SalesCartAdapter implements CartGateway {
  constructor(
    private readonly cartWritePort: CartWritePort,
    private readonly cartReadPort: CartReadPort
  ) {}

  /**
   * POR QUÉ: Limpiar un carrito es una operación crítica que debe ser atómica.
   * QUÉ: Expone una función para limpiar el carrito de compras de un usuario.
   * LÍMITES: No valida si el carrito existe antes de intentar limpiarlo.
   */
  async clearCart(userId: string | null, anonymousId: string | null): Promise<Result<void, DomainError | ConcurrencyError>> {
    return await this.cartWritePort.clearCart(userId, anonymousId);
  }

  /**
   * POR QUÉ: Obtener el estado de un carrito es fundamental para la experiencia del usuario.
   * QUÉ: Expone una función para recuperar el estado actual de un carrito de compras.
   * LÍMITES: No valida si el carrito existe antes de intentar recuperarlo.
   */
  async getCartSnapshot(
    userId: string | null,
    anonymousId: string | null
  ): Promise<Result<CartSnapshotDTO, DomainError>> {
    const result = await this.cartReadPort.getCartSnapshot(userId, anonymousId);

    if (result.isFailure) {
      return Result.fail(result.error!);
    }

    const cart = result.getValue();
    const items: CartItemDTO[] = cart.items.map((item) => ({ stickerId: item.stickerId, quantity: item.quantity }));
    return Result.ok({ id: cart.id, items });
  }
}
