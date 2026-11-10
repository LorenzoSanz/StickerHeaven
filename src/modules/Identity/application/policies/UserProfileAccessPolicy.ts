/**
 * POR QUÉ: El perfil es información sensible; un usuario no debe poder leer/editar el perfil de otro (IDOR).
 * QUÉ: Policy de Application que exige que el requester sea el mismo usuario objetivo (self-access).
 * LÍMITES: No contempla roles/administración; cubre el caso estándar “solo mi perfil”.
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserId } from "../../domain/UserId";

/**
 * POR QUÉ: Error dedicado para mapear a 403/401 sin filtrar detalles de la regla interna.
 */
class UnauthorizedUserProfileAccessError extends DomainError {
  constructor() {
    super("No autorizado");
  }
}

/**
 * POR QUÉ: Aísla la regla de acceso del controller; el caso de uso decide cuándo aplicarla.
 */
export class UserProfileAccessPolicy {
  /**
   * QUÉ: Retorna ok si targetUserId y requesterId coinciden; si no, falla con UnauthorizedUserProfileAccessError.
   */
  assertSelf(targetUserId: UserId, requesterId: UserId): Result<void, DomainError> {
    if (!targetUserId.equals(requesterId)) {
      return Result.fail(new UnauthorizedUserProfileAccessError());
    }
    return Result.ok<void, DomainError>();
  }
}
