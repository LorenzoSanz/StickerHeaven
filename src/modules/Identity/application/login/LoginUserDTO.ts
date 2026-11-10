/**
 * POR QUÉ: Define el contrato para user login input.
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa Application - DTO (Data Transfer Object).
 */

import { z } from "zod";

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;
