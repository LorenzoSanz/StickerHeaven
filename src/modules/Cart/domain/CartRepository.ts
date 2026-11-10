/**
 * POR QUÉ: Define el contrato para persisting Cart aggregates.
 * ESTRUCTURA: Capa Domain - Repository Interface.
 */
import { Cart } from "./Cart";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { CartId } from "./CartId";
import { OwnerId } from "./OwnerId";
import { AnonymousCartId } from "./AnonymousCartId";

export interface CartRepository {
  save(cart: Cart): Promise<Result<void, DomainError>>;
  findById(id: CartId): Promise<Result<Cart | null, DomainError>>;
  findByUserId(userId: OwnerId): Promise<Result<Cart | null, DomainError>>;
  findByGuestId(guestId: AnonymousCartId): Promise<Result<Cart | null, DomainError>>;
  delete(cartId: CartId): Promise<Result<void, DomainError>>;
}
