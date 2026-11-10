/**
 * POR QUÉ: El carrito guest y el carrito del usuario pueden coexistir antes del login; necesitamos unificar estado tras autenticación.
 * FLUJO: LoginUser (Identity) → OnLoginSuccess → (este adapter) → MergeCarts (Cart) → carrito del usuario queda consolidado.
 * ESTRUCTURA: Infrastructure adapter cross-module (permitido por los tests de arquitectura vía contracts/adapters).
 * LÍMITES: No debe contener lógica de merge; solo delega al caso de uso del módulo Cart.
 */

import { OnLoginSuccess } from "@/modules/Identity/application/interfaces/OnLoginSuccess";
import { MergeCarts } from "@/modules/Cart/application/merge/MergeCarts";
import { UserId } from "@/modules/Identity/domain/UserId";
import { ILogger } from "@/shared/domain/ILogger";

/**
 * POR QUÉ: Identity no debe depender del módulo Cart; implementamos el hook OnLoginSuccess en infraestructura para conectar módulos.
 */
/**
 * QUÉ: Implementa el hook OnLoginSuccess para unir carritos guest y usuario tras login.
 * INTEGRIDAD: Delega la lógica de merge al caso de uso MergeCarts del módulo Cart.
 */
export class CartMergeOnLoginAdapter implements OnLoginSuccess {
  constructor(
    private mergeCarts: MergeCarts,
    private logger: ILogger
  ) {}
  /**
   * PROPÓSITO: Unir carrito guest con carrito del usuario tras login.
   * @param userId - ID del usuario autenticado.
   * @param guestCartId - ID opcional del carrito guest. Si no existe, no se hace nada.
   */
  async execute(userId: UserId, guestCartId?: string): Promise<void> {
    if (!guestCartId) {
      return;
    }

    // POR QUÉ: El merge es best-effort: no bloqueamos el login si falla, pero lo registramos para diagnóstico.
    const result = await this.mergeCarts.execute({
      userId: userId.value,
      guestCartId: guestCartId,
    });

    if (result.isFailure) {
        this.logger.error(`Failed to merge carts for user ${userId.value}:`, result.error);
        // Elegimos no lanzar aquí para evitar bloquear el proceso de login,
        // pero en un sistema más estricto quizá queramos alertar al usuario.
    }
  }
}
