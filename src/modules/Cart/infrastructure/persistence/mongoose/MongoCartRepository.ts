/**
   * POR QUÉ: Implementación de persistencia para Cart usando MongoDB.
   * INTEGRIDAD: Mapea entidades del dominio a formato de persistencia y maneja errores de concurrencia.
   * ESTRUCTURA: Capa de infraestructura - Adapter.
 */
import { CartRepository } from "@/modules/Cart/domain/CartRepository";
import { Cart } from "@/modules/Cart/domain/Cart";
import { CartId } from "@/modules/Cart/domain/CartId";
import { CartModel, ICartDocument } from "./CartModel";
import { CartMapper } from "./CartMapper";
import { OwnerId } from "@/modules/Cart/domain/OwnerId";
import { AnonymousCartId } from "@/modules/Cart/domain/AnonymousCartId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { ConcurrencyError } from "@/shared/domain/ConcurrencyError";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class MongoCartRepository implements CartRepository {
  async save(cart: Cart): Promise<Result<void, DomainError>> {
    try {
      const raw = CartMapper.toPersistence(cart);
      
      const existing = await CartModel.findById(raw._id);

      if (existing) {
        existing.items = raw.items!; 
        existing.userId = raw.userId;
        existing.anonymousId = raw.anonymousId;
        existing.__v = raw.__v!; 
        
        await existing.save();
      } else {
        await CartModel.create(raw);
      }
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Error && error.name === "VersionError") {
        return Result.fail(new ConcurrencyError("Cart", cart.id.value));
      }
      return Result.fail(new DomainError(`Failed to save cart: ${error}`));
    }
  }

  async findById(id: CartId): Promise<Result<Cart | null, DomainError>> {
    try {
      const raw = await CartModel.findById(id.value).lean<ICartDocument>();
      if (!raw) return Result.ok(null);
      return Result.ok(CartMapper.toDomain(raw));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find cart: ${error}`));
    }
  }

  async findByUserId(userId: OwnerId): Promise<Result<Cart | null, DomainError>> {
    try {
      const raw = await CartModel.findOne({ userId: userId.value }).lean<ICartDocument>();
      if (!raw) return Result.ok(null);
      return Result.ok(CartMapper.toDomain(raw));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find cart by userId: ${error}`));
    }
  }

  async findByGuestId(guestId: AnonymousCartId): Promise<Result<Cart | null, DomainError>> {
    try {
      const raw = await CartModel.findOne({ anonymousId: guestId.value }).lean<ICartDocument>();
      if (!raw) return Result.ok(null);
      return Result.ok(CartMapper.toDomain(raw));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find cart by guestId: ${error}`));
    }
  }
  
  async delete(cartId: CartId): Promise<Result<void, DomainError>> {
    try {
      await CartModel.findByIdAndDelete(cartId.value);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to delete cart: ${error}`));
    }
  }
}
