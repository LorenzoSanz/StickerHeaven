import { DomainError } from "@/shared/domain/DomainError";
import { Result } from "@/shared/domain/Result";
import { ConcurrencyError } from "@/shared/domain/ConcurrencyError";

/**
 * POR QUÉ: Define el contrato para leer el estado de un carrito de compras.
 * INTEGRIDAD: Asegura que se gestione correctamente el flujo de éxito y fallo.
 * ESTRUCTURA: Núcleo compartido - Cross-cutting concern interface.
 */
type CartSnapshotItem = { stickerId: string; quantity: number };
// Esta type define la estructura de un carrito de compras.
export type CartSnapshot = {
  id: string;
  items: CartSnapshotItem[];
};
// Esta funcion define el contrato para leer el estado de un carrito de compras.
export interface CartReadPort {
  getCartSnapshot(userId: string | null, anonymousId: string | null): Promise<Result<CartSnapshot, DomainError>>;
}


/**
 * POR QUÉ: Limpiar un carrito es una operación crítica que debe ser atómica.
 * QUÉ: Expone una función para limpiar el carrito de compras de un usuario.
 * LÍMITES: No valida si el carrito existe antes de intentar limpiarlo.
 */
// Esta funcion define el contrato para limpiar un carrito de compras.
export interface CartWritePort {
  clearCart(userId: string | null, anonymousId: string | null): Promise<Result<void, DomainError | ConcurrencyError>>;
}
