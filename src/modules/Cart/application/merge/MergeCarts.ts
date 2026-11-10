import { CartRepository } from "@/modules/Cart/domain/CartRepository";
import { MergeCartsDTO } from "./MergeCartsDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OwnerId } from "@/modules/Cart/domain/OwnerId";
import { AnonymousCartId } from "@/modules/Cart/domain/AnonymousCartId";

export class MergeCarts {
  constructor(private cartRepository: CartRepository) {}

  /**
   * Fusiona el carrito anónimo (guest) dentro del carrito del usuario autenticado.
   * @param dto - Contiene userId y guestCartId para fusionar.
   * @returns Result<void> en éxito.
   *
   * NOTA DE DISEÑO:
   * - Si el usuario no tiene carrito, “promovemos” el carrito invitado asignándolo al usuario.
   * - Si el usuario ya tiene carrito, mergeamos items en el carrito del usuario y eliminamos el carrito invitado.
   */
  async execute(dto: MergeCartsDTO): Promise<Result<void, DomainError>> {
    const userIdOrError = OwnerId.create(dto.userId);
    // guestCartId del DTO es el anonymousId
    const anonymousIdOrError = AnonymousCartId.create(dto.guestCartId);

    if (userIdOrError.isFailure) return Result.fail(userIdOrError.error!);
    if (anonymousIdOrError.isFailure) return Result.fail(anonymousIdOrError.error!);

    const userId = userIdOrError.getValue();
    const anonymousId = anonymousIdOrError.getValue();

    const guestCartResult = await this.cartRepository.findByGuestId(anonymousId);
    if (guestCartResult.isFailure) return Result.fail(guestCartResult.error!);
    const guestCart = guestCartResult.getValue();
    
    // Si no existe carrito invitado o está vacío, no hay nada que fusionar.
    if (!guestCart || guestCart.items.length === 0) {
      return Result.ok();
    }

    // Asegura que el carrito invitado sea realmente anónimo (sanity check)
    if (guestCart.userId) {
       // Si ya pertenece a este usuario, el merge es un no-op.
       if (guestCart.userId.equals(userId)) return Result.ok();
       // Si pertenece a otro usuario, rechazamos para evitar mezclar datos entre cuentas.
       return Result.fail(new DomainError("Cannot merge a cart that belongs to another user"));
    }

    const userCartResult = await this.cartRepository.findByUserId(userId);
    if (userCartResult.isFailure) return Result.fail(userCartResult.error!);
    const userCart = userCartResult.getValue();

    if (userCart) {
      // Caso 1: el usuario ya tiene carrito. Mergeamos items y eliminamos el carrito invitado.
      userCart.merge(guestCart);
      
      const saveResult = await this.cartRepository.save(userCart);
      if (saveResult.isFailure) return Result.fail(saveResult.error!);
      
      const deleteResult = await this.cartRepository.delete(guestCart.id);
      if (deleteResult.isFailure) return Result.fail(deleteResult.error!);
    } else {
      // Caso 2: el usuario no tiene carrito. Promovemos el carrito invitado al usuario.
      guestCart.assignToUser(userId);
      const saveResult = await this.cartRepository.save(guestCart);
      if (saveResult.isFailure) return Result.fail(saveResult.error!);
    }

    return Result.ok();
  }
}
