/**
 * POR QUÉ: Algunas lecturas usan DTOs del read-model (QueryService) y aún así requieren ownership (evitar IDOR).
 * QUÉ: Policy de lectura que valida acceso sobre OrderDTO sin requerir reconstituir el agregado Order.
 * LÍMITES: Solo aplica a lecturas; para mutaciones se usa la policy sobre el agregado.
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";
import { UnauthorizedOrderAccessError } from "@/modules/Sales/domain/Errors";

/**
 * POR QUÉ: Mantener policies separadas para read/write evita acoplar queries a lógica de agregado.
 */
export class OrderReadAccessPolicy {
  /**
   * QUÉ: Retorna ok si el customerId del DTO coincide con el customerId autenticado; si no, falla con UnauthorizedOrderAccessError.
   */
  assertOwner(order: OrderDTO, customerId: string): Result<void, DomainError> {
    if (order.customerId !== customerId) {
      return Result.fail(new UnauthorizedOrderAccessError());
    }
    return Result.ok<void, DomainError>();
  }
}
