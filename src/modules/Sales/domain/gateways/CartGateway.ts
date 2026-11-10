import { DomainError } from "@/shared/domain/DomainError";
import { Result } from "@/shared/domain/Result";

export type CartItemDTO = { stickerId: string; quantity: number };

export type CartSnapshotDTO = {
  id: string;
  items: CartItemDTO[];
};

export interface CartGateway {
  getCartSnapshot(userId: string | null, anonymousId: string | null): Promise<Result<CartSnapshotDTO, DomainError>>;
  clearCart(userId: string | null, anonymousId: string | null): Promise<Result<void, DomainError>>;
}

