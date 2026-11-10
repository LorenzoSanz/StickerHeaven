import { z } from "zod";

export const SubscribeToNewsletterSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type SubscribeToNewsletterDTO = z.infer<typeof SubscribeToNewsletterSchema>;

