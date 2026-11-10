import { Cart } from "@/modules/Cart/domain/Cart";
import { CartId } from "@/modules/Cart/domain/CartId";
import { CartItem } from "@/modules/Cart/domain/CartItem";
import { StickerId } from "@/modules/Cart/domain/StickerId";
import { OwnerId } from "@/modules/Cart/domain/OwnerId";
import { AnonymousCartId } from "@/modules/Cart/domain/AnonymousCartId";
import { Quantity } from "@/shared/domain/Quantity";
import { ICartDocument } from "./CartModel";

export class CartMapper {
  static toDomain(raw: ICartDocument): Cart {
    const items = raw.items.map((item) => {
      const quantityResult = Quantity.create(item.quantity);
      if (quantityResult.isFailure) {
        throw new Error(`Invalid quantity in persistence: ${item.quantity}`);
      }
      return CartItem.create(
        StickerId.create(item.stickerId).getValue(),
        quantityResult.getValue(),
        item.addedAt
      ).getValue();
    });

    const userId = raw.userId ? OwnerId.create(raw.userId).getValue() : null;
    const anonymousId = raw.anonymousId ? AnonymousCartId.create(raw.anonymousId).getValue() : null;

    return Cart.reconstitute({
      userId,
      anonymousId,
      items,
      version: raw.__v ?? 0
    }, CartId.create(raw._id).getValue());
  }

  static toPersistence(cart: Cart): Partial<ICartDocument> {
    return {
      _id: cart.id.value,
      userId: cart.userId ? cart.userId.value : null,
      anonymousId: cart.anonymousId ? cart.anonymousId.value : null,
      items: cart.items.map(item => ({
        stickerId: item.stickerId.value,
        quantity: item.quantity.value,
        addedAt: item.addedAt
      })),
      __v: cart.version
    };
  }
}
