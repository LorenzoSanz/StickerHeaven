/**
 * POR QUÉ: DTO para deleting a sticker.
 * INTEGRIDAD: Pure data structure.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface DeleteStickerDTO {
  stickerId: string;
  requesterId: string;
}
