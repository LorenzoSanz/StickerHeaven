import { CartRepository } from "@/modules/Cart/domain/CartRepository";
import { UpdateCartItemQuantityDTO } from "./UpdateCartItemQuantityDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { StickerId } from "@/shared/domain/StickerId";
import { Quantity } from "@/shared/domain/Quantity";
import { OwnerId } from "@/modules/Cart/domain/OwnerId";
import { AnonymousCartId } from "@/modules/Cart/domain/AnonymousCartId";

export class UpdateCartItemQuantity {
  constructor(private cartRepository: CartRepository) {}

  async execute(dto: UpdateCartItemQuantityDTO): Promise<Result<void, DomainError>> {
    let cartResult;
    
    if (dto.userId) {
      const ownerIdResult = OwnerId.create(dto.userId);
      if (ownerIdResult.isFailure) return Result.fail(ownerIdResult.error!);
      cartResult = await this.cartRepository.findByUserId(ownerIdResult.getValue());
    } else if (dto.anonymousId) {
      const anonymousIdResult = AnonymousCartId.create(dto.anonymousId);
      if (anonymousIdResult.isFailure) return Result.fail(anonymousIdResult.error!);
      cartResult = await this.cartRepository.findByGuestId(anonymousIdResult.getValue());
    } else {
      return Result.fail(new DomainError("User ID or Anonymous ID is required"));
    }

    if (cartResult.isFailure) return Result.fail(cartResult.error!);
    const cart = cartResult.getValue();

    if (!cart) {
      return Result.fail(new DomainError("Cart not found"));
    }

    const stickerIdOrError = StickerId.create(dto.stickerId);
    const quantityOrError = Quantity.create(dto.quantity);

    if (stickerIdOrError.isFailure) return Result.fail(stickerIdOrError.error!);
    if (quantityOrError.isFailure) return Result.fail(quantityOrError.error!);

    const updateResult = cart.updateItemQuantity(stickerIdOrError.getValue(), quantityOrError.getValue());
    if (updateResult.isFailure) return Result.fail(updateResult.error!);

    return await this.cartRepository.save(cart);
  }
}
