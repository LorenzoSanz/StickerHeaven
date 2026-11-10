/**
 * POR QUÉ: DTO para listar stickers.
 * INTEGRIDAD: Transporta datos entre límites sin comportamiento.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface StickerDTO {
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

export interface ListStickersDTO {
  stickers: StickerDTO[];
}
