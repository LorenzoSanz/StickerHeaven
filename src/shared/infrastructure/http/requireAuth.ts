/**
 * POR QUÉ: Centraliza la verificación “hay sesión autenticada” para que los routers no repitan lógica y sea fácil endurecerla.
 * INTEGRIDAD: Asegura que se devuelva un error genérico al cliente para no exponer detalles del servidor.
 * Middleware Hono exige `userId` en el contexto (poblado por AuthMiddleware) y retorna 401 si falta.
 * LÍMITES: No decide autorización/ownership; eso se valida en Policies dentro de los casos de uso.
 */
import type { MiddlewareHandler } from "hono";
import { HttpStatus } from "./HttpStatus";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const userId = c.get("userId") as unknown as string | undefined;
  if (!userId) {
    return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
  }
  await next();
};
