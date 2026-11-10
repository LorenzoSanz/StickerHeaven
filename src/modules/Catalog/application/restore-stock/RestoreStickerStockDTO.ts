/**
 * POR QUÉ: DTO para restoring sticker stock.
 * INTEGRIDAD: Pure data structure.
 * ESTRUCTURA: Capa Application - DTO.
 */
import { Quantity } from "../../../../shared/domain/Quantity";

export interface RestoreStickerStockDTO {
  id: string;
  quantity: Quantity;
}
