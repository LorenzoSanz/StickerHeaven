/**
 * POR QUÉ: DTO para reducing sticker stock.
 * INTEGRIDAD: Pure data structure.
 * ESTRUCTURA: Capa Application - DTO.
 */
import { Quantity } from "../../../../shared/domain/Quantity";

export interface ReduceStickerStockDTO {
  id: string;
  quantity: Quantity;
}
