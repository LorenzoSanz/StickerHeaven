import { CartRepository } from "../../domain/CartRepository";
import { Cart } from "../../domain/Cart";
import { CartId } from "../../domain/CartId";
import { StickerId } from "../../domain/StickerId";
import { OwnerId } from "../../domain/OwnerId";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { CatalogGateway } from "../CatalogGateway";
import { AnonymousCartId } from "../../domain/AnonymousCartId";
import { Quantity } from "../../../../shared/domain/Quantity";
import { AddItemToCartDTO } from "./AddItemToCartDTO";

export class AddItemToCart {
  constructor(
    private cartRepository: CartRepository,
    private catalogGateway: CatalogGateway
  ) {}

  async execute(dto: AddItemToCartDTO): Promise<Result<{ cartId: string; anonymousId: string | null }, DomainError>> {
    const { userId, anonymousId, stickerId, quantity } = dto;
    
    const quantityResult = Quantity.create(quantity);
    if (quantityResult.isFailure) {
      return Result.fail(quantityResult.error!);
    }
    const quantityVO = quantityResult.getValue();

    const stickerIdVO = StickerId.create(stickerId);
    if (stickerIdVO.isFailure) {
      return Result.fail(stickerIdVO.error!);
    }
    const sId = stickerIdVO.getValue();

    const productInfoResult = await this.catalogGateway.getProductInfo(sId);
    if (productInfoResult.isFailure) {
        return Result.fail(productInfoResult.error!);
    }
    const product = productInfoResult.getValue();
    
    if (product.stock < quantityVO.value) {
        return Result.fail(new DomainError("Insufficient stock"));
    }

    // 3) Resolver carrito (usuario o invitado)
    let cart: Cart | null = null;
    let anonymousIdVO: AnonymousCartId | null = null;

    if (anonymousId) {
        const result = AnonymousCartId.create(anonymousId);
        if (result.isFailure) return Result.fail(result.error!);
        anonymousIdVO = result.getValue();
    }
    
    if (userId) {
        const ownerId = OwnerId.create(userId).getValue();
        const cartResult = await this.cartRepository.findByUserId(ownerId);
        if (cartResult.isFailure) return Result.fail(cartResult.error!);
        cart = cartResult.getValue();
    } else if (anonymousIdVO) {
        const cartResult = await this.cartRepository.findByGuestId(anonymousIdVO);
        if (cartResult.isFailure) return Result.fail(cartResult.error!);
        cart = cartResult.getValue();
    }

    if (!cart) {
        const id = CartId.create(crypto.randomUUID()).getValue();
        const ownerId = userId ? OwnerId.create(userId).getValue() : null;
        
        // Si es guest y no hay anonymousId, generamos uno para poder recuperar el carrito luego (cookie).
        if (!ownerId && !anonymousIdVO) {
            anonymousIdVO = AnonymousCartId.create(crypto.randomUUID()).getValue();
        }

        cart = Cart.create(id, ownerId, anonymousIdVO);
    }

    const result = cart.addItem(sId, quantityVO);
    
    if (result.isFailure) {
        return Result.fail(result.error!);
    }

    const saveResult = await this.cartRepository.save(cart);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }
    
    return Result.ok({
        cartId: cart.id.value,
        anonymousId: cart.anonymousId ? cart.anonymousId.value : null
    });
  }
}
