/**
 * POR QUÉ: Caso de uso para vaciar el carrito (p.ej., tras checkout).
 * INTEGRIDAD: Elimina el carrito de la persistencia.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { CartRepository } from "../../domain/CartRepository";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OwnerId } from "../../domain/OwnerId";
import { AnonymousCartId } from "../../domain/AnonymousCartId";

/**
 * POR QUÉ: Modela “vaciar carrito” como comando (write-model) para poder dispararlo desde UI o subscribers tras eventos.
 */
export class ClearCart {
  constructor(private cartRepository: CartRepository) {}

  async execute(userId: string | null, anonymousId: string | null): Promise<Result<void, DomainError>> {
    let cartResult;

    if (userId) {
      const ownerIdResult = OwnerId.create(userId);
      if (ownerIdResult.isFailure) return Result.fail(ownerIdResult.error!);
      cartResult = await this.cartRepository.findByUserId(ownerIdResult.getValue());
    } else if (anonymousId) {
      const anonymousIdResult = AnonymousCartId.create(anonymousId);
      if (anonymousIdResult.isFailure) return Result.fail(anonymousIdResult.error!);
      cartResult = await this.cartRepository.findByGuestId(anonymousIdResult.getValue());
    } else {
      // Si no hay identidad (userId) ni carrito anónimo (anonymousId), no hay nada que vaciar.
      return Result.ok();
    }

    if (cartResult.isFailure) return Result.fail(cartResult.error!);
    const cart = cartResult.getValue();

    if (!cart) {
      return Result.ok(); // Ya estaba vacío o no existe
    }

    // Elegimos eliminar el documento del carrito por completo
    return await this.cartRepository.delete(cart.id);
  }
}
