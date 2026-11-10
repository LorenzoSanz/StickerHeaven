import { CartQueryService } from "@/modules/Cart/application/queries/CartQueryService";
import { CartDTO, CartItemDTO } from "@/modules/Cart/application/get/CartDTO";
import { CartModel, ICartDocument } from "../persistence/mongoose/CartModel";
import { CatalogGateway } from "@/modules/Cart/application/CatalogGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { env } from "@/config/env";

import { StickerId } from "@/shared/domain/StickerId";

export class MongoCartQueryService implements CartQueryService {
  constructor(private catalogGateway: CatalogGateway) {}

  async getCart(userId: string | null, guestId: string | null): Promise<Result<CartDTO, DomainError>> {
    try {
      let doc: ICartDocument | null = null;

      if (userId) {
        doc = await CartModel.findOne({ userId }).lean<ICartDocument>();
      } else if (guestId) {
        doc = await CartModel.findOne({ anonymousId: guestId }).lean<ICartDocument>();
      }
      
      if (!doc) {
        return Result.ok({
            items: [],
            totalAmount: 0,
            currency: env.CURRENCY
        });
      }

      // Fetch real-time prices
      const stickerIds: StickerId[] = [];
      for (const item of doc.items) {
          const idResult = StickerId.create(item.stickerId);
          if (idResult.isSuccess) {
              stickerIds.push(idResult.getValue());
          }
      }

      const productsResult = await this.catalogGateway.getProductsInfo(stickerIds);

      if (productsResult.isFailure) {
        return Result.fail(productsResult.error!);
      }

      const products = productsResult.getValue();
      const productMap = new Map(products.map(p => [p.id, p]));

      const itemsDTO: CartItemDTO[] = [];
      let cartTotal = 0;

      for (const item of doc.items) {
        const product = productMap.get(item.stickerId);
        if (!product) continue;

        const itemTotal = product.priceAmount * item.quantity;
        cartTotal += itemTotal;

        itemsDTO.push({
            stickerId: item.stickerId,
            stickerName: product.name,
            imageUrl: product.imageUrl,
            quantity: item.quantity,
            price: product.priceAmount,
            currency: product.priceCurrency,
            total: itemTotal
        });
      }

      return Result.ok({
        id: doc._id,
        anonymousCartId: doc.anonymousId || undefined,
        items: itemsDTO,
        totalAmount: cartTotal,
        currency: env.CURRENCY
      });

    } catch (error) {
      return Result.fail(new DomainError(`Failed to get cart: ${error}`));
    }
  }
}
