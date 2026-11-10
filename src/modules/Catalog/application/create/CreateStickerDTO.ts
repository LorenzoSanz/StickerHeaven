/**
 * POR QUÉ: DTO para crear un sticker.
 * INTEGRIDAD: Transporta datos entre límites sin comportamiento.
 * ESTRUCTURA: Capa Application - DTO.
 */
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
