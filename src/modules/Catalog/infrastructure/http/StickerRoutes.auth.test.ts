import { describe, expect, it } from "bun:test";
import type { MiddlewareHandler } from "hono";
import { createCatalogRouter } from "./StickerRoutes";

// Pruebas para rutas protegidas por autenticación.
describe("StickerRoutes auth", () => {
  it("blocks protected routes when auth middleware does not set userId", async () => {
    const authMiddleware: MiddlewareHandler = async (_c, next) => {
      await next();
    };

    const controller = {
      list: (c: any) => c.json({ ok: true }, 200),
      search: (c: any) => c.json({ ok: true }, 200),
      getById: (c: any) => c.json({ ok: true }, 200),
      create: (c: any) => c.json({ ok: true }, 200),
      update: (c: any) => c.json({ ok: true }, 200),
      delete: (c: any) => c.json({ ok: true }, 200),
    };

    const router = createCatalogRouter(controller as any, authMiddleware);

    const res = await router.request("/", { method: "POST" });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autorizado" });
  });
});
