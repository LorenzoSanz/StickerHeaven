import { z } from "zod";

export const UpdateStickerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.object({
    amount: z.number().positive("Price amount must be positive"),
    currency: z.string().length(3, "Currency must be 3 characters code")
  }).optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer").optional(),
});

export type UpdateStickerDTO = z.infer<typeof UpdateStickerSchema> & {
    stickerId: string;
    ownerId: string;
};
