/**
 * POR QUÉ: Define la estructura de datos de entrada para el registro de usuario.
 * INTEGRIDAD: DTO (Data Transfer Object) desacopla las capas externas (API) de la firma del caso de uso.
 * ESTRUCTURA: Capa Application - Define el límite de entrada.
 */

import { z } from "zod";

export const RegisterUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
