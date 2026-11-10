/**
 * POR QUÉ: DTO para Cart con precios en tiempo real.
 * INTEGRIDAD: Define la forma de los datos del carrito devueltos a clientes.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface CartItemDTO {
  stickerId: string;
  stickerName?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  currency: string;
  total: number;
}

export interface CartDTO {
  id?: string;
  anonymousCartId?: string;
  items: CartItemDTO[];
  totalAmount: number;
  currency: string;
}
