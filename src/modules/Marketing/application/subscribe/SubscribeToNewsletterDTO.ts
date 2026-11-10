// PROPÓSITO: DTO para suscribir a newsletters.
// INTEGRIDAD: Garantiza que solo se suscriban correos electrónicos válidos.
// ESTRUCTURA: Capa Application.
import { z } from "zod";

export const SubscribeToNewsletterSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type SubscribeToNewsletterDTO = z.infer<typeof SubscribeToNewsletterSchema>;

