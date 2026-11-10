/**
 * POR QUÉ: DTO para updating cart item quantity.
 * INTEGRIDAD: Define input structure.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface UpdateCartItemQuantityDTO {
  userId: string | null;
  anonymousId: string | null;
  stickerId: string;
  quantity: number;
}
