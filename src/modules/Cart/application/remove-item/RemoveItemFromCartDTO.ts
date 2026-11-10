/**
 * POR QUÉ: DTO para eliminar un item del carrito.
 * INTEGRIDAD: Define input structure.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface RemoveItemFromCartDTO {
  userId: string | null;
  anonymousId: string | null;
  stickerId: string;
}
