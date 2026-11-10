/**
 * POR QUÉ: Al crear un sticker, el ownerId debe provenir del requester autenticado, no de un input manipulable del cliente.
 * QUÉ: Policy que asegura que `ownerId` asignado coincide con `requesterId` (anti-impersonation/IDOR).
 * LÍMITES: No valida roles ni permisos adicionales; solo igualdad de identidad.
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OwnerId } from "../../domain/OwnerId";
import { StickerOwnershipError } from "../../domain/Errors";

/**
 * POR QUÉ: Mantener la regla de ownership fuera del controller evita lógica de seguridad en infraestructura.
 */
export class StickerOwnerAssignmentPolicy {
  /**
   * QUÉ: Retorna ok si requesterId y ownerId coinciden; si no, falla con StickerOwnershipError (mapeable a 403).
   */
  assertSameOwner(ownerId: OwnerId, requesterId: OwnerId): Result<void, DomainError> {
    if (!ownerId.equals(requesterId)) {
      return Result.fail(new StickerOwnershipError());
    }
    return Result.ok<void, DomainError>();
  }
}
