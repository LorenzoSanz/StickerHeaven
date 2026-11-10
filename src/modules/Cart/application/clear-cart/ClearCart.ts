import { CartRepository } from "@/modules/Cart/domain/CartRepository";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OwnerId } from "@/modules/Cart/domain/OwnerId";
import { AnonymousCartId } from "@/modules/Cart/domain/AnonymousCartId";

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
