import { z } from "zod";

export const CreateOrderSchema = z.object({
  userId: z.string().optional(), // Inyectado por el controller
  items: z.array(z.object({
    stickerId: z.string(),
    quantity: z.number().int().positive("Quantity must be positive")
  })).min(1, "Order must have at least one item")
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
