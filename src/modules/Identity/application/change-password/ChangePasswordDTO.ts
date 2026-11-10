/**
 * POR QUÉ: DTO para changing user password.
 * INTEGRIDAD: Define input data structure and validation schema.
 * ESTRUCTURA: Capa Application - DTO.
 */
import { z } from "zod";
// DTO para cambiar la contraseña de un usuario.
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
