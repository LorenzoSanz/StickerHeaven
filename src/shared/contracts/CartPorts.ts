import { DomainError } from "@/shared/domain/DomainError";
import { Result } from "@/shared/domain/Result";
import { ConcurrencyError } from "@/shared/domain/ConcurrencyError";

type CartSnapshotItem = { stickerId: string; quantity: number };
export type CartSnapshot = {
  id: string;
  items: CartSnapshotItem[];
};
// Esta funcion define el contrato para leer el estado de un carrito de compras.
export interface CartReadPort {
  getCartSnapshot(userId: string | null, anonymousId: string | null): Promise<Result<CartSnapshot, DomainError>>;
}

// Esta funcion define el contrato para limpiar un carrito de compras.
export interface CartWritePort {
  clearCart(userId: string | null, anonymousId: string | null): Promise<Result<void, DomainError | ConcurrencyError>>;
}
