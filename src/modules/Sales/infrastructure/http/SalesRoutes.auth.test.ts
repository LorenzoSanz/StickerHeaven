import { describe, expect, it } from "bun:test";
import type { MiddlewareHandler } from "hono";
import { createSalesRouter } from "./SalesRoutes";

describe("SalesRoutes auth", () => {
  it("blocks protected routes when auth middleware does not set userId", async () => {
    const authMiddleware: MiddlewareHandler = async (_c, next) => {
      await next();
    };

    const controller = {
      checkout: (c: any) => c.json({ ok: true }, 200),
      create: (c: any) => c.json({ ok: true }, 200),
      cancel: (c: any) => c.json({ ok: true }, 200),
      list: (c: any) => c.json({ ok: true }, 200),
      getById: (c: any) => c.json({ ok: true }, 200),
    };

    const webhookController = {
      handleWebhook: (c: any) => c.json({ received: true }, 200),
    };

    const router = createSalesRouter(controller as any, webhookController as any, authMiddleware);

    const res = await router.request("/checkout", { method: "POST" });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autorizado" });
  });
});
