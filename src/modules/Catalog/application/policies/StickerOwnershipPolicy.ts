/**
 * POR QUÉ: Prevenir IDOR (Insecure Direct Object Reference): un usuario no debe poder mutar stickers ajenos por adivinar IDs.
 * QUÉ: Policy de Application que valida ownership del agregado Sticker para operaciones de escritura (update/delete).
 * LÍMITES: No consulta persistencia ni HTTP; recibe el agregado ya cargado y la identidad del requester como OwnerId.
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";
import { StickerOwnershipError } from "@/modules/Catalog/domain/Errors";

/**
 * POR QUÉ: Centralizamos la regla de acceso para que sea consistente y testeable en un único punto.
 */
export class StickerOwnershipPolicy {
  /**
   * QUÉ: Retorna ok si el requester es dueño del sticker; si no, falla con StickerOwnershipError (mapeable a 403 en HTTP).
   */
  assertOwner(sticker: Sticker, ownerId: OwnerId): Result<void, DomainError> {
    if (!sticker.isOwnedBy(ownerId)) {
      return Result.fail(new StickerOwnershipError());
    }
    return Result.ok(undefined);
  }
}
