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
