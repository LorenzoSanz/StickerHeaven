/**
 * POR QUÉ: Prevenir acceso no autorizado a pedidos (IDOR) al consultar/cancelar pedidos por id desde UI.
 * QUÉ: Policy de Application que asegura que el pedido pertenece al customer autenticado.
 * LÍMITES: No decide roles (admin); esta política cubre el escenario “cliente solo ve sus pedidos”.
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Order } from "@/modules/Sales/domain/Order";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { UnauthorizedOrderAccessError } from "@/modules/Sales/domain/Errors";

/**
 * POR QUÉ: Centraliza la regla de ownership para que los casos de uso la apliquen de forma consistente.
 */
export class OrderAccessPolicy {
  /**
   * QUÉ: Retorna ok si el order pertenece al customer; si no, falla con UnauthorizedOrderAccessError (mapeable a 403).
   */
  assertOwner(order: Order, customerId: CustomerId): Result<void, DomainError> {
    if (order.customerId.value !== customerId.value) {
      return Result.fail(new UnauthorizedOrderAccessError());
    }
    return Result.ok(undefined);
  }
}
