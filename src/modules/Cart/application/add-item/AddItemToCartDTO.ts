/**
 * POR QUÉ: DTO para añadir items al carrito.
 * INTEGRIDAD: Define input data structure and validation schema.
 * ESTRUCTURA: Capa Application - DTO.
 */
import { z } from "zod";

export const AddItemToCartSchema = z.object({
  stickerId: z.string().min(1, "Sticker ID is required"),
  quantity: z.number().int().positive("Quantity must be positive")
});

export interface AddItemToCartDTO {
  userId: string | null;
  anonymousId: string | null;
  stickerId: string;
  quantity: number;
}
