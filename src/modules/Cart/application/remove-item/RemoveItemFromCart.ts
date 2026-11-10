import { CartRepository } from "../../domain/CartRepository";
import { RemoveItemFromCartDTO } from "./RemoveItemFromCartDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { StickerId } from "@/shared/domain/StickerId";
import { OwnerId } from "../../domain/OwnerId";
import { AnonymousCartId } from "../../domain/AnonymousCartId";

export class RemoveItemFromCart {
  constructor(private cartRepository: CartRepository) {}

  async execute(dto: RemoveItemFromCartDTO): Promise<Result<void, DomainError>> {
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
    if (stickerIdOrError.isFailure) return Result.fail(stickerIdOrError.error!);

    const removeResult = cart.removeItem(stickerIdOrError.getValue());
    if (removeResult.isFailure) return Result.fail(removeResult.error!);

    return await this.cartRepository.save(cart);
  }
}
