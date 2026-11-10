/**
 * POR QUÉ: DTO para getting a sticker por ID.
 * INTEGRIDAD: Pure data structure.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface GetStickerByIdDTO {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  imageUrl: string;
  tags: string[];
  stock: number;
  createdAt: string;
}
