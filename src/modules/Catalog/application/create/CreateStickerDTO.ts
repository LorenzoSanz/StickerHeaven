export interface CreateStickerDTO {
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  imageUrl: string;
  tags: string[];
  stock: number;
  ownerId: string;
  requesterId: string;
}
