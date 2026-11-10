/**
 * POR QUÉ: DTO para updating user profile.
 * INTEGRIDAD: Define input data structure and validation schema.
 * ESTRUCTURA: Capa Application - DTO.
 */
import { z } from "zod";

export const UpdateUserProfileSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  username: z.string().min(2, "Username must be at least 2 characters").optional()
});

export interface UpdateUserProfileDTO {
  userId: string;
  requesterId: string;
  email?: string;
  username?: string;
}
