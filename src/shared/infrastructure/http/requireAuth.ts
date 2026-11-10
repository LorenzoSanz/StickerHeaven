import type { MiddlewareHandler } from "hono";
import { HttpStatus } from "./HttpStatus";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const userId = c.get("userId") as unknown as string | undefined;
  if (!userId) {
    return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
  }
  await next();
};
